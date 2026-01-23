import { Hono } from "hono";
import { cors } from "hono/cors";

interface Env {
  DB: any;
}

const app = new Hono<{ Bindings: Env }>();

app.use("/*", cors());

app.onError((err, c) => {
  return c.json({
    error: err.message,
    stack: err.stack,
    cause: err.cause
  }, 500);
});

// Exchange Rate Routes
app.get("/api/exchange-rate", async (c) => {
  const db = c.env.DB;
  const result = await db.prepare("SELECT * FROM exchange_rate ORDER BY id DESC LIMIT 1").first();
  return c.json(result);
});

app.put("/api/exchange-rate", async (c) => {
  const db = c.env.DB;
  const { cop_to_ves } = await c.req.json();

  await db.prepare(
    "UPDATE exchange_rate SET cop_to_ves = ?, updated_at = CURRENT_TIMESTAMP WHERE id = (SELECT id FROM exchange_rate ORDER BY id DESC LIMIT 1)"
  ).bind(cop_to_ves).run();

  const result = await db.prepare("SELECT * FROM exchange_rate ORDER BY id DESC LIMIT 1").first();
  return c.json(result);
});

// Color Routes
app.get("/api/colors", async (c) => {
  const db = c.env.DB;
  const { results } = await db.prepare("SELECT * FROM colors ORDER BY name").all();
  return c.json(results);
});

app.post("/api/colors", async (c) => {
  const db = c.env.DB;
  const { name, hex_code } = await c.req.json();

  const result = await db.prepare(
    "INSERT INTO colors (name, hex_code) VALUES (?, ?)"
  ).bind(name, hex_code).run();

  const color = await db.prepare("SELECT * FROM colors WHERE id = ?").bind(result.meta.last_row_id).first();
  return c.json(color);
});

app.put("/api/colors/:id", async (c) => {
  const db = c.env.DB;
  const id = c.req.param("id");
  const { name, hex_code } = await c.req.json();

  await db.prepare(
    "UPDATE colors SET name = ?, hex_code = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?"
  ).bind(name, hex_code, id).run();

  const color = await db.prepare("SELECT * FROM colors WHERE id = ?").bind(id).first();
  return c.json(color);
});

app.delete("/api/colors/:id", async (c) => {
  const db = c.env.DB;
  const id = c.req.param("id");

  await db.prepare("DELETE FROM colors WHERE id = ?").bind(id).run();
  return c.json({ success: true });
});

// Product Routes
app.get("/api/products", async (c) => {
  const db = c.env.DB;
  const { results: products } = await db.prepare("SELECT * FROM products_base ORDER BY name").all();

  const productsWithVariants = await Promise.all(products.map(async (product: any) => {
    const { results: variants } = await db.prepare(`
      SELECT pv.*, c.name as color_name, c.hex_code as color_hex
      FROM product_variants pv
      LEFT JOIN colors c ON pv.color_id = c.id
      WHERE pv.product_id = ?
      ORDER BY c.name
    `).bind(product.id).all();

    const total_stock = variants.reduce((sum: number, v: any) => sum + v.stock, 0);

    return {
      ...product,
      variants,
      total_stock
    };
  }));

  return c.json(productsWithVariants);
});

app.post("/api/products", async (c) => {
  const db = c.env.DB;
  try {
    const { name, price_cop, image_url, variants = [] } = await c.req.json();

    const productResult = await db.prepare(
      "INSERT INTO products_base (name, price_cop, image_url) VALUES (?, ?, ?)"
    ).bind(name, price_cop, image_url || null).run();

    const productId = productResult.meta.last_row_id;

    for (const variant of variants) {
      await db.prepare(
        "INSERT INTO product_variants (product_id, color_id, stock) VALUES (?, ?, ?)"
      ).bind(productId, variant.color_id, variant.stock || 0).run();
    }

    const product = await db.prepare("SELECT * FROM products_base WHERE id = ?").bind(productId).first();
    const { results: variantsList } = await db.prepare(`
      SELECT pv.*, c.name as color_name, c.hex_code as color_hex
      FROM product_variants pv
      LEFT JOIN colors c ON pv.color_id = c.id
      WHERE pv.product_id = ?
    `).bind(productId).all();

    const total_stock = variantsList.reduce((sum: number, v: any) => sum + v.stock, 0);

    return c.json({ ...product, variants: variantsList, total_stock });
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

app.put("/api/products/:id", async (c) => {
  const db = c.env.DB;
  const idStr = c.req.param("id");
  const id = parseInt(idStr);

  try {
    const json = await c.req.json();
    const { name, price_cop, image_url, variants } = json;

    if (!name || price_cop === undefined) {
      return c.json({ error: "Nombre y precio son requeridos" }, 400);
    }

    await db.prepare(
      "UPDATE products_base SET name = ?, price_cop = ?, image_url = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?"
    ).bind(name, price_cop, image_url ?? null, id).run();

    if (variants && Array.isArray(variants)) {
      await db.prepare("DELETE FROM product_variants WHERE product_id = ?").bind(id).run();

      for (const variant of variants) {
        if (variant.color_id) {
          await db.prepare(
            "INSERT INTO product_variants (product_id, color_id, stock) VALUES (?, ?, ?)"
          ).bind(id, variant.color_id, variant.stock || 0).run();
        }
      }
    }

    const product = await db.prepare("SELECT * FROM products_base WHERE id = ?").bind(id).first();
    const { results: variantsList } = await db.prepare(`
      SELECT pv.*, c.name as color_name, c.hex_code as color_hex
      FROM product_variants pv
      LEFT JOIN colors c ON pv.color_id = c.id
      WHERE pv.product_id = ?
    `).bind(id).all();

    const total_stock = variantsList ? variantsList.reduce((sum: number, v: any) => sum + v.stock, 0) : 0;

    return c.json({ ...product, variants: variantsList || [], total_stock });
  } catch (error: any) {
    return c.json({ error: error.message, stack: error.stack }, 500);
  }
});

app.delete("/api/products/:id", async (c) => {
  const db = c.env.DB;
  const id = c.req.param("id");

  await db.prepare("DELETE FROM product_variants WHERE product_id = ?").bind(id).run();
  await db.prepare("DELETE FROM products_base WHERE id = ?").bind(id).run();
  return c.json({ success: true });
});

// Customer Routes
app.get("/api/customers", async (c) => {
  const db = c.env.DB;
  const { results } = await db.prepare("SELECT * FROM customers ORDER BY name").all();
  return c.json(results);
});

app.post("/api/customers", async (c) => {
  const db = c.env.DB;
  const { name, phone } = await c.req.json();

  const result = await db.prepare(
    "INSERT INTO customers (name, phone) VALUES (?, ?)"
  ).bind(name, phone || null).run();

  const customer = await db.prepare("SELECT * FROM customers WHERE id = ?").bind(result.meta.last_row_id).first();
  return c.json(customer);
});

app.put("/api/customers/:id", async (c) => {
  const db = c.env.DB;
  const id = c.req.param("id");
  const { name, phone } = await c.req.json();

  await db.prepare(
    "UPDATE customers SET name = ?, phone = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?"
  ).bind(name, phone || null, id).run();

  const customer = await db.prepare("SELECT * FROM customers WHERE id = ?").bind(id).first();
  return c.json(customer);
});

app.delete("/api/customers/:id", async (c) => {
  const db = c.env.DB;
  const id = c.req.param("id");

  await db.prepare("DELETE FROM customers WHERE id = ?").bind(id).run();
  return c.json({ success: true });
});

// Package Routes
app.get("/api/packages", async (c) => {
  const db = c.env.DB;
  const { results: packages } = await db.prepare("SELECT * FROM packages ORDER BY created_at DESC").all();

  const packagesWithItems = await Promise.all(packages.map(async (pkg: any) => {
    const { results: items } = await db.prepare(`
      SELECT pi.*, pb.name as product_name, c.name as color_name, c.hex_code as color_hex
      FROM package_items pi
      LEFT JOIN products_base pb ON pi.product_id = pb.id
      LEFT JOIN colors c ON pi.color_id = c.id
      WHERE pi.package_id = ?
    `).bind(pkg.id).all();

    return { ...pkg, items };
  }));

  return c.json(packagesWithItems);
});

app.post("/api/packages", async (c) => {
  const db = c.env.DB;
  try {
    const { name, items, total_ves } = await c.req.json();

    const pkgResult = await db.prepare(
      "INSERT INTO packages (name, status, total_ves) VALUES (?, 'Armado', ?)"
    ).bind(name, total_ves || 0).run();

    const packageId = pkgResult.meta.last_row_id;

    for (const item of items) {
      await db.prepare(
        "INSERT INTO package_items (package_id, product_id, color_id, quantity) VALUES (?, ?, ?, ?)"
      ).bind(packageId, item.product_id, item.color_id, item.quantity).run();
    }

    const pkg = await db.prepare("SELECT * FROM packages WHERE id = ?").bind(packageId).first();
    const { results: itemsList } = await db.prepare(`
      SELECT pi.*, pb.name as product_name, c.name as color_name, c.hex_code as color_hex
      FROM package_items pi
      LEFT JOIN products_base pb ON pi.product_id = pb.id
      LEFT JOIN colors c ON pi.color_id = c.id
      WHERE pi.package_id = ?
    `).bind(packageId).all();

    return c.json({ ...pkg, items: itemsList });
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

app.get("/api/packages/stock", async (c) => {
  const db = c.env.DB;

  try {
    // 1. Get Stock by Package
    // We subtract (sold - returned) to get the true sold quantity from that package
    const { results: packageStock } = await db.prepare(`
      SELECT 
        pkg.id as package_id,
        pkg.name as package_name,
        pi.product_id,
        pb.name as product_name,
        pi.color_id,
        col.name as color_name,
        col.hex_code as color_hex,
        pi.quantity as initial_quantity,
        COALESCE(SUM(si.quantity), 0) as sold_quantity,
        (pi.quantity - COALESCE(SUM(si.quantity), 0)) as available_quantity
      FROM packages pkg
      JOIN package_items pi ON pkg.id = pi.package_id
      JOIN products_base pb ON pi.product_id = pb.id
      JOIN colors col ON pi.color_id = col.id
      LEFT JOIN sale_items si ON pi.package_id = si.package_id AND pi.product_id = si.product_id AND pi.color_id = si.color_id
      WHERE pkg.status = 'Entregado'
      GROUP BY pkg.id, pi.product_id, pi.color_id
      HAVING available_quantity > 0
    `).all();

    // 2. Get Global Stock for each product/variant from the source of truth (product_variants)
    const { results: globalStock } = await db.prepare(`
      SELECT 
        pv.product_id,
        pb.name as product_name,
        pv.color_id,
        col.name as color_name,
        col.hex_code as color_hex,
        pv.stock
      FROM product_variants pv
      JOIN products_base pb ON pv.product_id = pb.id
      JOIN colors col ON pv.color_id = col.id
      WHERE pv.stock > 0
    `).all();

    // 3. Calculate "homeless" stock: Global Stock - Stock accounted for in packages
    // This includes items that were returned and didn't have a package, 
    // or stock that was manually added/restored without package link.
    const results: any[] = [...packageStock];

    // Sum up what's already accounted for by variant across all packages
    const packageTotalByVariant: Record<string, number> = {};
    packageStock.forEach((s: any) => {
      const key = `${s.product_id}-${s.color_id}`;
      packageTotalByVariant[key] = (packageTotalByVariant[key] || 0) + s.available_quantity;
    });

    globalStock.forEach((g: any) => {
      const key = `${g.product_id}-${g.color_id}`;
      const inPackages = packageTotalByVariant[key] || 0;
      const homeless = g.stock - inPackages;

      // If there's more in global stock than in packages, it's "Inventario General"
      if (homeless > 0) {
        results.push({
          package_id: 0,
          package_name: '📦 Inventario General',
          product_id: g.product_id,
          product_name: g.product_name,
          color_id: g.color_id,
          color_name: g.color_name,
          color_hex: g.color_hex,
          initial_quantity: homeless,
          sold_quantity: 0,
          available_quantity: homeless
        });
      }
    });

    // Sort to keep packages together and then general stock
    return c.json(results.sort((a, b) => {
      if (a.package_id === 0) return 1; // General at the end
      if (b.package_id === 0) return -1;
      return b.package_id - a.package_id; // Recent packages first
    }));
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

app.put("/api/packages/:id", async (c) => {
  const db = c.env.DB;
  const id = c.req.param("id");
  try {
    const { name, items, status, total_ves } = await c.req.json();

    const currentPkg: any = await db.prepare("SELECT status FROM packages WHERE id = ?").bind(id).first();

    // 1. Handle Status Change Logic (Stock Management)
    if (status && status !== currentPkg.status) {
      if (status === 'Entregado') {
        // Adding to stock
        const { results: currentItems } = await db.prepare("SELECT * FROM package_items WHERE package_id = ?").bind(id).all();
        for (const item of currentItems) {
          // Ensure variant exists in inventory
          const variant = await db.prepare("SELECT 1 FROM product_variants WHERE product_id = ? AND color_id = ?")
            .bind((item as any).product_id, (item as any).color_id).first();

          if (!variant) {
            await db.prepare("INSERT INTO product_variants (product_id, color_id, stock) VALUES (?, ?, ?)")
              .bind((item as any).product_id, (item as any).color_id, 0).run();
          }

          await db.prepare(`
            UPDATE product_variants 
            SET stock = stock + ?, updated_at = CURRENT_TIMESTAMP 
            WHERE product_id = ? AND color_id = ?
          `).bind((item as any).quantity, (item as any).product_id, (item as any).color_id).run();
        }
      } else if (currentPkg.status === 'Entregado') {
        // Removing from stock (Reverting)
        const { results: currentItems } = await db.prepare("SELECT * FROM package_items WHERE package_id = ?").bind(id).all();
        for (const item of currentItems) {
          await db.prepare(`
            UPDATE product_variants 
            SET stock = stock - ?, updated_at = CURRENT_TIMESTAMP 
            WHERE product_id = ? AND color_id = ?
          `).bind((item as any).quantity, (item as any).product_id, (item as any).color_id).run();
        }
      }
    }

    // 2. Update Package Details (Name, total_ves)
    if (name !== undefined || total_ves !== undefined) {
      const pkg: any = await db.prepare("SELECT name, total_ves FROM packages WHERE id = ?").bind(id).first();
      const finalName = name !== undefined ? name : pkg.name;
      const finalTotalVes = total_ves !== undefined ? total_ves : pkg.total_ves;

      await db.prepare("UPDATE packages SET name = ?, total_ves = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?")
        .bind(finalName, finalTotalVes, id).run();
    }

    // 3. Update Status
    if (status) {
      await db.prepare("UPDATE packages SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?").bind(status, id).run();
    }

    // 4. Update Items (Only if items array is provided)
    if (items && Array.isArray(items)) {
      // Delete old items
      await db.prepare("DELETE FROM package_items WHERE package_id = ?").bind(id).run();

      // Insert new items
      for (const item of items) {
        await db.prepare(
          "INSERT INTO package_items (package_id, product_id, color_id, quantity) VALUES (?, ?, ?, ?)"
        ).bind(id, item.product_id, item.color_id, item.quantity).run();
      }
    }

    const pkg = await db.prepare("SELECT * FROM packages WHERE id = ?").bind(id).first();
    const { results: itemsList } = await db.prepare(`
      SELECT pi.*, pb.name as product_name, c.name as color_name, c.hex_code as color_hex
      FROM package_items pi
      LEFT JOIN products_base pb ON pi.product_id = pb.id
      LEFT JOIN colors c ON pi.color_id = c.id
      WHERE pi.package_id = ?
    `).bind(id).all();

    return c.json({ ...pkg, items: itemsList });
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

app.delete("/api/packages/:id", async (c) => {
  const db = c.env.DB;
  const id = c.req.param("id");

  const pkg: any = await db.prepare("SELECT status FROM packages WHERE id = ?").bind(id).first();

  if (pkg.status === 'Entregado') {
    const { results: items } = await db.prepare("SELECT * FROM package_items WHERE package_id = ?").bind(id).all();

    for (const item of items) {
      await db.prepare(`
        UPDATE product_variants 
        SET stock = stock - ?, updated_at = CURRENT_TIMESTAMP 
        WHERE product_id = ? AND color_id = ?
      `).bind((item as any).quantity, (item as any).product_id, (item as any).color_id).run();
    }
  }

  await db.prepare("DELETE FROM package_items WHERE package_id = ?").bind(id).run();
  await db.prepare("DELETE FROM packages WHERE id = ?").bind(id).run();
  return c.json({ success: true });
});

// Sales Routes
app.get("/api/sales", async (c) => {
  const db = c.env.DB;
  const { results: sales } = await db.prepare(`
    SELECT s.*, c.name as customer_name
    FROM sales s
    LEFT JOIN customers c ON s.customer_id = c.id
    ORDER BY s.created_at DESC
  `).all();

  const salesWithItems = await Promise.all(sales.map(async (sale: any) => {
    const { results: items } = await db.prepare(`
      SELECT si.*, pb.name as product_name, co.name as color_name, co.hex_code as color_hex, pkg.name as package_name
      FROM sale_items si
      LEFT JOIN products_base pb ON si.product_id = pb.id
      LEFT JOIN colors co ON si.color_id = co.id
      LEFT JOIN packages pkg ON si.package_id = pkg.id
      WHERE si.sale_id = ?
    `).bind(sale.id).all();

    return { ...sale, items };
  }));

  return c.json(salesWithItems);
});

app.post("/api/sales", async (c) => {
  const db = c.env.DB;
  const { customer_id, items, paid_cop, paid_ves, exchange_rate, is_credit } = await c.req.json();

  let total_cop = 0;
  for (const item of items) {
    const product: any = await db.prepare("SELECT price_cop FROM products_base WHERE id = ?").bind(item.product_id).first();
    total_cop += product.price_cop * item.quantity;
  }

  const saleResult = await db.prepare(
    "INSERT INTO sales (customer_id, total_cop, paid_cop, paid_ves, exchange_rate, is_credit) VALUES (?, ?, ?, ?, ?, ?)"
  ).bind(customer_id, total_cop, paid_cop || 0, paid_ves || 0, exchange_rate, is_credit ? 1 : 0).run();

  const saleId = saleResult.meta.last_row_id;

  // FIX: Record initial payment in payments table
  if ((paid_cop || 0) > 0 || (paid_ves || 0) > 0) {
    await db.prepare(
      "INSERT INTO payments (customer_id, amount_cop, amount_ves, exchange_rate, note, sale_id, is_initial) VALUES (?, ?, ?, ?, ?, ?, 1)"
    ).bind(customer_id, paid_cop || 0, paid_ves || 0, exchange_rate, `Abono inicial venta #${saleId}`, saleId).run();
  }

  for (const item of items) {
    const product: any = await db.prepare("SELECT price_cop FROM products_base WHERE id = ?").bind(item.product_id).first();

    await db.prepare(
      "INSERT INTO sale_items (sale_id, product_id, color_id, quantity, price_cop, package_id) VALUES (?, ?, ?, ?, ?, ?)"
    ).bind(saleId, item.product_id, item.color_id, item.quantity, product.price_cop, item.package_id || null).run();

    // If a package_id is provided, we should probably also decrement the variant associated with that package if we track it.
    // However, the current schema 'product_variants' is global per product/color.
    // The requirement says "select from which package to extract".
    // This implies we might need a more granular stock tracking, or at least we decrement the global stock.
    await db.prepare(`
      UPDATE product_variants 
      SET stock = stock - ?, updated_at = CURRENT_TIMESTAMP 
      WHERE product_id = ? AND color_id = ?
    `).bind(item.quantity, item.product_id, item.color_id).run();
  }

  if (is_credit) {
    const paidCopFromVes = Math.round((paid_ves || 0) / exchange_rate);
    const balance = total_cop - (paid_cop || 0) - paidCopFromVes;

    await db.prepare(
      "UPDATE customers SET balance_cop = balance_cop + ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?"
    ).bind(balance, customer_id).run();
  }

  const sale = await db.prepare(`
    SELECT s.*, c.name as customer_name
    FROM sales s
    LEFT JOIN customers c ON s.customer_id = c.id
    WHERE s.id = ?
  `).bind(saleId).first();

  const { results: itemsList } = await db.prepare(`
    SELECT si.*, pb.name as product_name, co.name as color_name, co.hex_code as color_hex, pkg.name as package_name
    FROM sale_items si
    LEFT JOIN products_base pb ON si.product_id = pb.id
    LEFT JOIN colors co ON si.color_id = co.id
    LEFT JOIN packages pkg ON si.package_id = pkg.id
    WHERE si.sale_id = ?
  `).bind(saleId).all();

  return c.json({ ...sale, items: itemsList });
});

app.delete("/api/sales/:id", async (c) => {
  const db = c.env.DB;
  const id = c.req.param("id");

  try {
    const sale: any = await db.prepare("SELECT * FROM sales WHERE id = ?").bind(id).first();
    if (!sale) return c.json({ error: "Venta no encontrada" }, 404);

    const { results: items } = await db.prepare("SELECT * FROM sale_items WHERE sale_id = ?").bind(id).all();

    // 1. Restore stock
    for (const item of items) {
      await db.prepare(`
        UPDATE product_variants 
        SET stock = stock + ?, updated_at = CURRENT_TIMESTAMP 
        WHERE product_id = ? AND color_id = ?
      `).bind(item.quantity, item.product_id, item.color_id).run();
    }

    // 2. Adjust customer balance if it was credit
    if (sale.is_credit) {
      const paidVesInCop = Math.round((sale.paid_ves || 0) / (sale.exchange_rate || 1));
      const debtToReverse = sale.total_cop - (sale.paid_cop || 0) - paidVesInCop;

      await db.prepare(
        "UPDATE customers SET balance_cop = balance_cop - ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?"
      ).bind(debtToReverse, sale.customer_id).run();
    }

    // 3. Delete related payments
    await db.prepare("DELETE FROM payments WHERE sale_id = ?").bind(id).run();

    // 4. Delete sale items and sale
    await db.prepare("DELETE FROM sale_items WHERE sale_id = ?").bind(id).run();
    await db.prepare("DELETE FROM sales WHERE id = ?").bind(id).run();

    return c.json({ success: true });
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// Payments Routes
app.get("/api/payments", async (c) => {
  const db = c.env.DB;
  const { results } = await db.prepare(`
    SELECT p.*, c.name as customer_name 
    FROM payments p
    LEFT JOIN customers c ON p.customer_id = c.id
    ORDER BY p.created_at DESC
  `).all();
  return c.json(results);
});

app.get("/api/payments/:customerId", async (c) => {
  const db = c.env.DB;
  const customerId = c.req.param("customerId");
  const { results } = await db.prepare(
    "SELECT * FROM payments WHERE customer_id = ? ORDER BY created_at DESC"
  ).bind(customerId).all();
  return c.json(results);
});

app.post("/api/payments", async (c) => {
  const db = c.env.DB;
  const { customer_id, amount_cop, amount_ves, exchange_rate, note, sale_id } = await c.req.json();

  try {
    const safe_amount_cop = amount_cop || 0;
    const safe_amount_ves = amount_ves || 0;
    const safe_exchange_rate = exchange_rate || 1; // Prevent division by zero

    const totalCop = safe_amount_cop + Math.round(safe_amount_ves / safe_exchange_rate);

    const result = await db.prepare(
      "INSERT INTO payments (customer_id, amount_cop, amount_ves, exchange_rate, note, sale_id) VALUES (?, ?, ?, ?, ?, ?)"
    ).bind(customer_id, safe_amount_cop, safe_amount_ves, safe_exchange_rate, note || null, sale_id || null).run();

    await db.prepare(
      "UPDATE customers SET balance_cop = balance_cop - ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?"
    ).bind(totalCop, customer_id).run();

    // Distribute payment to sales
    let creditSales: any[] = [];
    if (sale_id) {
      const sale = await db.prepare("SELECT * FROM sales WHERE id = ?").bind(sale_id).first();
      if (sale) creditSales = [sale];
    } else {
      const { results } = await db.prepare(
        "SELECT * FROM sales WHERE customer_id = ? AND is_credit = 1 AND (total_cop - paid_cop - (paid_ves / exchange_rate)) > 0 ORDER BY created_at ASC"
      ).bind(customer_id).all();
      creditSales = results;
    }

    let remaining = totalCop;
    for (const sale of creditSales) {
      if (remaining <= 0) break;
      const debt = sale.total_cop - sale.paid_cop - Math.round((sale.paid_ves || 0) / sale.exchange_rate);
      const amountToApply = Math.min(remaining, debt);

      if (amountToApply > 0) {
        await db.prepare(
          "UPDATE sales SET paid_cop = paid_cop + ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?"
        ).bind(amountToApply, sale.id).run();
        remaining -= amountToApply;
      }
    }

    const payment = await db.prepare("SELECT * FROM payments WHERE id = ?").bind(result.meta.last_row_id).first();
    return c.json(payment);
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

app.delete("/api/payments/:id", async (c) => {
  const db = c.env.DB;
  const id = c.req.param("id");

  const payment: any = await db.prepare("SELECT * FROM payments WHERE id = ?").bind(id).first();
  if (!payment) return c.json({ error: "Payment not found" }, 404);

  const totalCop = payment.amount_cop + Math.round(payment.amount_ves / payment.exchange_rate);

  // 1. Reverse customer balance
  await db.prepare(
    "UPDATE customers SET balance_cop = balance_cop + ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?"
  ).bind(totalCop, payment.customer_id).run();

  // 2. Reverse sale paid amount(s)
  if (payment.sale_id) {
    await db.prepare(
      "UPDATE sales SET paid_cop = paid_cop - ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?"
    ).bind(totalCop, payment.sale_id).run();
  } else {
    // Reverse general payment by finding sales that currently have a paid_cop > 0
    // and subtracting from most recent ones first (greedy reverse)
    const { results: paidSales } = await db.prepare(
      "SELECT * FROM sales WHERE customer_id = ? AND paid_cop > 0 ORDER BY updated_at DESC"
    ).bind(payment.customer_id).all();

    let toReverse = totalCop;
    for (const sale of paidSales) {
      if (toReverse <= 0) break;
      const amountToReverse = Math.min(toReverse, (sale as any).paid_cop);
      await db.prepare(
        "UPDATE sales SET paid_cop = paid_cop - ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?"
      ).bind(amountToReverse, (sale as any).id).run();
      toReverse -= amountToReverse;
    }
  }

  await db.prepare("DELETE FROM payments WHERE id = ?").bind(id).run();
  return c.json({ success: true });
});

// Order Routes
app.get("/api/orders", async (c) => {
  const db = c.env.DB;
  const { results: orders } = await db.prepare(`
    SELECT o.*, c.name as customer_name
    FROM orders o
    LEFT JOIN customers c ON o.customer_id = c.id
    ORDER BY o.created_at DESC
  `).all();

  const ordersWithItems = await Promise.all(orders.map(async (order: any) => {
    const { results: items } = await db.prepare(`
      SELECT oi.*, pb.name as product_name, col.name as color_name, col.hex_code as color_hex
      FROM order_items oi
      JOIN products_base pb ON oi.product_id = pb.id
      JOIN colors col ON oi.color_id = col.id
      WHERE oi.order_id = ?
    `).bind(order.id).all();
    return { ...order, items };
  }));

  return c.json(ordersWithItems);
});

app.post("/api/orders", async (c) => {
  const db = c.env.DB;
  const { customer_id, items, note, prepayment_cop } = await c.req.json();

  const orderResult = await db.prepare(
    "INSERT INTO orders (customer_id, note, prepayment_cop, status) VALUES (?, ?, ?, ?)"
  ).bind(customer_id, note || null, prepayment_cop || 0, 'Pendiente').run();

  const orderId = orderResult.meta.last_row_id;

  for (const item of items) {
    await db.prepare(
      "INSERT INTO order_items (order_id, product_id, color_id, quantity) VALUES (?, ?, ?, ?)"
    ).bind(orderId, item.product_id, item.color_id, item.quantity).run();
  }

  const order = await db.prepare(`
    SELECT o.*, c.name as customer_name
    FROM orders o
    LEFT JOIN customers c ON o.customer_id = c.id
    WHERE o.id = ?
  `).bind(orderId).first();

  const { results: itemsList } = await db.prepare(`
    SELECT oi.*, pb.name as product_name, col.name as color_name, col.hex_code as color_hex
    FROM order_items oi
    JOIN products_base pb ON oi.product_id = pb.id
    JOIN colors col ON oi.color_id = col.id
    WHERE oi.order_id = ?
  `).bind(orderId).all();

  return c.json({ ...order, items: itemsList });
});

app.patch("/api/orders/items/:id", async (c) => {
  const db = c.env.DB;
  const itemId = c.req.param("id");
  const { is_purchased } = await c.req.json();

  await db.prepare(
    "UPDATE order_items SET is_purchased = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?"
  ).bind(is_purchased ? 1 : 0, itemId).run();

  return c.json({ success: true });
});

app.delete("/api/orders/items/:id", async (c) => {
  const db = c.env.DB;
  const id = c.req.param("id");

  try {
    await db.prepare("DELETE FROM order_items WHERE id = ?").bind(id).run();
    return c.json({ success: true });
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

app.delete("/api/orders/:id", async (c) => {
  const db = c.env.DB;
  const id = c.req.param("id");

  try {
    await db.prepare("DELETE FROM order_items WHERE order_id = ?").bind(id).run();
    await db.prepare("DELETE FROM orders WHERE id = ?").bind(id).run();
    return c.json({ success: true });
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

app.post("/api/orders/batch-package", async (c) => {
  const db = c.env.DB;
  const { name, total_ves, itemIds } = await c.req.json();

  try {
    // 1. Create the package
    const pkgResult = await db.prepare(
      "INSERT INTO packages (name, total_ves, status) VALUES (?, ?, ?)"
    ).bind(name, total_ves, 'Armado').run();
    const packageId = pkgResult.meta.last_row_id;

    // 2. Link order items to this package
    for (const itemId of itemIds) {
      await db.prepare(
        "UPDATE order_items SET package_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?"
      ).bind(packageId, itemId).run();
    }

    // 3. Create package items (aggregated from order items)
    const { results: aggregatedItems } = await db.prepare(`
      SELECT product_id, color_id, SUM(quantity) as total_quantity
      FROM order_items
      WHERE id IN (${itemIds.map(() => '?').join(',')})
      GROUP BY product_id, color_id
    `).bind(...itemIds).all();

    for (const item of aggregatedItems) {
      await db.prepare(
        "INSERT INTO package_items (package_id, product_id, color_id, quantity) VALUES (?, ?, ?, ?)"
      ).bind(packageId, item.product_id, item.color_id, item.total_quantity).run();
    }

    return c.json({ success: true, packageId });
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

app.post("/api/orders/deliver", async (c) => {
  const db = c.env.DB;

  try {
    const { orderIds, itemIds, is_credit, exchangeRate, additional_payment } = await c.req.json();

    if (!orderIds || orderIds.length === 0) throw new Error("No hay pedidos seleccionados");
    if (!itemIds || itemIds.length === 0) throw new Error("No hay prendas seleccionadas");

    const extraPay = additional_payment || 0;

    const { results: orders } = await db.prepare(
      `SELECT * FROM orders WHERE id IN (${orderIds.map(() => '?').join(',')})`
    ).bind(...orderIds).all();

    if (orders.length === 0) throw new Error("Pedidos no encontrados");

    const { results: items } = await db.prepare(`
      SELECT oi.*, pb.price_cop
      FROM order_items oi
      JOIN products_base pb ON oi.product_id = pb.id
      WHERE oi.id IN (${itemIds.map(() => '?').join(',')})
    `).bind(...itemIds).all();

    if (items.length === 0) throw new Error("No se encontraron prendas válidas");

    let totalCop = 0;
    items.forEach((item: any) => {
      totalCop += item.quantity * item.price_cop;
    });

    let totalPrepayment = 0;
    orders.forEach((o: any) => {
      totalPrepayment += o.prepayment_cop || 0;
    });

    // Total already paid = Initial Prepayment + New Additional Payment
    const totalPaidNow = totalPrepayment + extraPay;

    // Create Sale
    const saleResult = await db.prepare(
      "INSERT INTO sales (customer_id, total_cop, paid_cop, paid_ves, exchange_rate, is_credit) VALUES (?, ?, ?, ?, ?, ?)"
    ).bind(orders[0].customer_id, totalCop, is_credit ? totalPaidNow : totalCop, 0, exchangeRate, is_credit ? 1 : 0).run();
    const saleId = saleResult.meta.last_row_id;

    // Create Sale Items and update stock
    for (const item of items as any[]) {
      await db.prepare(
        "INSERT INTO sale_items (sale_id, product_id, color_id, quantity, package_id, price_cop) VALUES (?, ?, ?, ?, ?, ?)"
      ).bind(saleId, item.product_id, item.color_id, item.quantity, item.package_id, item.price_cop).run();

      // Decrement stock
      await db.prepare(`
        UPDATE product_variants 
        SET stock = stock - ?, updated_at = CURRENT_TIMESTAMP 
        WHERE product_id = ? AND color_id = ?
      `).bind(item.quantity, item.product_id, item.color_id).run();
    }

    // Update customer balance if credit (Apply total already paid)
    if (is_credit) {
      const balanceChange = totalCop - totalPaidNow;
      await db.prepare(
        "UPDATE customers SET balance_cop = balance_cop + ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?"
      ).bind(balanceChange, orders[0].customer_id).run();

      // Create Initial Payment Record for consistency in "Abonos History"
      if (totalPaidNow > 0) {
        await db.prepare(
          "INSERT INTO payments (customer_id, amount_cop, amount_ves, exchange_rate, note, sale_id, is_initial) VALUES (?, ?, ?, ?, ?, ?, ?)"
        ).bind(orders[0].customer_id, totalPaidNow, 0, exchangeRate, 'Abono Inicial (Entrega)', saleId, 1).run();
      }
    }

    // Delete orders and items instead of marking as completed
    for (const orderId of orderIds) {
      await db.prepare("DELETE FROM order_items WHERE order_id = ?").bind(orderId).run();
      await db.prepare("DELETE FROM orders WHERE id = ?").bind(orderId).run();
    }

    return c.json({ success: true, saleId });
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});





app.put("/api/sales/:id", async (c) => {
  const db = c.env.DB;
  const id = c.req.param("id");
  const { paid_cop, paid_ves, is_credit } = await c.req.json();

  try {
    const oldSale: any = await db.prepare("SELECT * FROM sales WHERE id = ?").bind(id).first();
    if (!oldSale) throw new Error("Venta no encontrada");

    // Sync Payments Table (Initial Payment)
    const initialPayment: any = await db.prepare("SELECT * FROM payments WHERE sale_id = ? AND is_initial = 1").bind(id).first();

    if (initialPayment) {
      if ((paid_cop || 0) === 0 && (paid_ves || 0) === 0) {
        // If changed to 0, delete the payment? Or just update to 0. 
        // Better to update to 0 to keep history that it WAS a sale with initial payment potential.
        // Actually, if paid is 0, it's just a full credit sale with no down payment. 
        await db.prepare("UPDATE payments SET amount_cop = 0, amount_ves = 0, exchange_rate = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?")
          .bind(oldSale.exchange_rate, initialPayment.id).run();
      } else {
        await db.prepare("UPDATE payments SET amount_cop = ?, amount_ves = ?, exchange_rate = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?")
          .bind(paid_cop || 0, paid_ves || 0, oldSale.exchange_rate, initialPayment.id).run();
      }
    } else if ((paid_cop || 0) > 0 || (paid_ves || 0) > 0) {
      // Create if missing
      await db.prepare(
        "INSERT INTO payments (customer_id, amount_cop, amount_ves, exchange_rate, note, sale_id, is_initial) VALUES (?, ?, ?, ?, ?, ?, 1)"
      ).bind(oldSale.customer_id, paid_cop || 0, paid_ves || 0, oldSale.exchange_rate, `Abono inicial venta #${id}`, id).run();
    }

    // Reverse old balance influence if it was credit
    if (oldSale.is_credit) {
      const oldPaidFromVes = Math.round(oldSale.paid_ves / oldSale.exchange_rate);
      const oldBalance = oldSale.total_cop - oldSale.paid_cop - oldPaidFromVes;
      await db.prepare("UPDATE customers SET balance_cop = balance_cop - ? WHERE id = ?").bind(oldBalance, oldSale.customer_id).run();
    }

    // Update sale
    await db.prepare(`
      UPDATE sales 
      SET paid_cop = ?, paid_ves = ?, is_credit = ?, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `).bind(paid_cop, paid_ves, is_credit ? 1 : 0, id).run();

    // Apply new balance influence if it is credit
    if (is_credit) {
      const newPaidFromVes = Math.round((paid_ves || 0) / oldSale.exchange_rate);
      const newBalance = oldSale.total_cop - (paid_cop || 0) - newPaidFromVes;
      await db.prepare("UPDATE customers SET balance_cop = balance_cop + ? WHERE id = ?").bind(newBalance, oldSale.customer_id).run();
    }

    return c.json({ success: true });
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

app.put("/api/payments/:id", async (c) => {
  const db = c.env.DB;
  const id = c.req.param("id");
  const { amount_cop, amount_ves, note } = await c.req.json();

  try {
    const oldPayment: any = await db.prepare("SELECT * FROM payments WHERE id = ?").bind(id).first();
    if (!oldPayment) throw new Error("Pago no encontrado");

    // Reverse old payment amount from customer balance
    const oldTotal = oldPayment.amount_cop + Math.round(oldPayment.amount_ves / oldPayment.exchange_rate);
    await db.prepare("UPDATE customers SET balance_cop = balance_cop + ? WHERE id = ?").bind(oldTotal, oldPayment.customer_id).run();

    // Update payment
    await db.prepare(`
      UPDATE payments 
      SET amount_cop = ?, amount_ves = ?, note = ?, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `).bind(amount_cop, amount_ves, note, id).run();

    // Apply new payment amount to customer balance
    const newTotal = amount_cop + Math.round(amount_ves / oldPayment.exchange_rate);
    await db.prepare("UPDATE customers SET balance_cop = balance_cop - ? WHERE id = ?").bind(newTotal, oldPayment.customer_id).run();

    return c.json({ success: true });
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

app.delete("/api/orders/:id", async (c) => {
  const db = c.env.DB;
  const id = c.req.param("id");

  await db.prepare("DELETE FROM order_items WHERE order_id = ?").bind(id).run();
  await db.prepare("DELETE FROM orders WHERE id = ?").bind(id).run();
  return c.json({ success: true });
});


// Audit Routes
app.get("/api/audit/consistency", async (c) => {
  const db = c.env.DB;
  const issues: any[] = [];

  try {
    // 1. Check Customer Balance Consistency
    const { results: customers } = await db.prepare("SELECT * FROM customers").all();

    for (const customer of customers) {
      // Calculate Total Debt (Credit Sales)
      const { total_debt } = await db.prepare(`
        SELECT COALESCE(SUM(total_cop), 0) as total_debt 
        FROM sales 
        WHERE customer_id = ? AND is_credit = 1
      `).bind(customer.id).first();

      // Calculate Total Paid (All payments)
      // Note: We need to calculate value of payments. 
      // Payments logic: total = amount_cop + round(amount_ves / exchange_rate)
      const { results: payments } = await db.prepare(`
        SELECT * FROM payments WHERE customer_id = ?
      `).bind(customer.id).all();

      let total_paid = 0;
      payments.forEach((p: any) => {
        total_paid += p.amount_cop + Math.round(p.amount_ves / p.exchange_rate);
      });

      const expected_balance = (total_debt as number) - total_paid;

      if (customer.balance_cop !== expected_balance) {
        issues.push({
          type: "CUSTOMER_BALANCE_MISMATCH",
          customer_id: customer.id,
          customer_name: customer.name,
          current_balance: customer.balance_cop,
          expected_balance: expected_balance,
          details: {
            total_debt,
            total_paid
          }
        });
      }
    }

    // 2. Check Sales Paid Consistency
    const { results: sales } = await db.prepare("SELECT * FROM sales").all();

    for (const sale of sales) {
      // Calculate Total Paid for this sale found in payments table
      const { results: salePayments } = await db.prepare(`
        SELECT * FROM payments WHERE sale_id = ?
      `).bind(sale.id).all();

      let calculated_paid = 0;
      salePayments.forEach((p: any) => {
        calculated_paid += p.amount_cop + Math.round(p.amount_ves / p.exchange_rate);
      });

      // Special check: If sale.paid_cop > 0 but no payments exist, it might be a migration issue or "initial payment" not recorded as payment row.
      // However, our new logic enforces payment rows for everything.
      // Let's flag only if they differ.

      if (sale.paid_cop !== calculated_paid) {
        issues.push({
          type: "SALE_PAID_MISMATCH",
          sale_id: sale.id,
          customer_id: sale.customer_id,
          current_paid: sale.paid_cop,
          calculated_paid: calculated_paid,
          diff: sale.paid_cop - calculated_paid
        });
      }
    }

    return c.json({
      status: "OK",
      timestamp: new Date().toISOString(),
      issues_count: issues.length,
      issues
    });

  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

export default app;
