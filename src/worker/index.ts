import { Hono } from "hono";
import { cors } from "hono/cors";

interface Env {
  DB: any;
}

const app = new Hono<{ Bindings: Env }>();

app.use("/*", cors());

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
  const { name, price_cop, variants } = await c.req.json();

  const productResult = await db.prepare(
    "INSERT INTO products_base (name, price_cop) VALUES (?, ?)"
  ).bind(name, price_cop).run();

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
});

app.put("/api/products/:id", async (c) => {
  const db = c.env.DB;
  const id = c.req.param("id");
  const { name, price_cop, variants } = await c.req.json();

  await db.prepare(
    "UPDATE products_base SET name = ?, price_cop = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?"
  ).bind(name, price_cop, id).run();

  await db.prepare("DELETE FROM product_variants WHERE product_id = ?").bind(id).run();

  for (const variant of variants) {
    await db.prepare(
      "INSERT INTO product_variants (product_id, color_id, stock) VALUES (?, ?, ?)"
    ).bind(id, variant.color_id, variant.stock || 0).run();
  }

  const product = await db.prepare("SELECT * FROM products_base WHERE id = ?").bind(id).first();
  const { results: variantsList } = await db.prepare(`
    SELECT pv.*, c.name as color_name, c.hex_code as color_hex
    FROM product_variants pv
    LEFT JOIN colors c ON pv.color_id = c.id
    WHERE pv.product_id = ?
  `).bind(id).all();

  const total_stock = variantsList.reduce((sum: number, v: any) => sum + v.stock, 0);

  return c.json({ ...product, variants: variantsList, total_stock });
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
  const { name, items } = await c.req.json();

  const pkgResult = await db.prepare(
    "INSERT INTO packages (name, status) VALUES (?, 'Armado')"
  ).bind(name).run();

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
});

app.put("/api/packages/:id", async (c) => {
  const db = c.env.DB;
  const id = c.req.param("id");
  const { name, items, status } = await c.req.json();

  const currentPkg: any = await db.prepare("SELECT status FROM packages WHERE id = ?").bind(id).first();

  // 1. Handle Status Change Logic (Stock Management)
  if (status && status !== currentPkg.status) {
    if (status === 'Entregado') {
      // Adding to stock
      const { results: currentItems } = await db.prepare("SELECT * FROM package_items WHERE package_id = ?").bind(id).all();
      for (const item of currentItems) {
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

  // 2. Update Package Details (Name)
  if (name) {
    await db.prepare("UPDATE packages SET name = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?").bind(name, id).run();
  }

  // 3. Update Status
  if (status) {
    await db.prepare("UPDATE packages SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?").bind(status, id).run();
  }

  // 4. Update Items (Only if items array is provided)
  // WARNING: Changing items while status is 'Entregado' will cause stock inconsistencies unless we handle it.
  // We will assume UI prevents editing items if status is 'Entregado', or user must revert status first.
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
      SELECT si.*, pb.name as product_name, co.name as color_name, co.hex_code as color_hex
      FROM sale_items si
      LEFT JOIN products_base pb ON si.product_id = pb.id
      LEFT JOIN colors co ON si.color_id = co.id
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

  for (const item of items) {
    const product: any = await db.prepare("SELECT price_cop FROM products_base WHERE id = ?").bind(item.product_id).first();

    await db.prepare(
      "INSERT INTO sale_items (sale_id, product_id, color_id, quantity, price_cop) VALUES (?, ?, ?, ?, ?)"
    ).bind(saleId, item.product_id, item.color_id, item.quantity, product.price_cop).run();

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
    SELECT si.*, pb.name as product_name, co.name as color_name, co.hex_code as color_hex
    FROM sale_items si
    LEFT JOIN products_base pb ON si.product_id = pb.id
    LEFT JOIN colors co ON si.color_id = co.id
    WHERE si.sale_id = ?
  `).bind(saleId).all();

  return c.json({ ...sale, items: itemsList });
});

app.delete("/api/sales/:id", async (c) => {
  const db = c.env.DB;
  const id = c.req.param("id");

  const sale: any = await db.prepare("SELECT * FROM sales WHERE id = ?").bind(id).first();
  const { results: items } = await db.prepare("SELECT * FROM sale_items WHERE sale_id = ?").bind(id).all();

  for (const item of items) {
    await db.prepare(`
      UPDATE product_variants 
      SET stock = stock + ?, updated_at = CURRENT_TIMESTAMP 
      WHERE product_id = ? AND color_id = ?
    `).bind((item as any).quantity, (item as any).product_id, (item as any).color_id).run();
  }

  if (sale.is_credit) {
    const paidCopFromVes = Math.round((sale.paid_ves || 0) / sale.exchange_rate);
    const balance = sale.total_cop - (sale.paid_cop || 0) - paidCopFromVes;

    await db.prepare(
      "UPDATE customers SET balance_cop = balance_cop - ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?"
    ).bind(balance, sale.customer_id).run();
  }

  await db.prepare("DELETE FROM sale_items WHERE sale_id = ?").bind(id).run();
  await db.prepare("DELETE FROM sales WHERE id = ?").bind(id).run();
  return c.json({ success: true });
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
  const { customer_id, amount_cop, amount_ves, exchange_rate, note } = await c.req.json();

  const totalCop = amount_cop + Math.round(amount_ves / exchange_rate);

  const result = await db.prepare(
    "INSERT INTO payments (customer_id, amount_cop, amount_ves, exchange_rate, note) VALUES (?, ?, ?, ?, ?)"
  ).bind(customer_id, amount_cop || 0, amount_ves || 0, exchange_rate, note || null).run();

  await db.prepare(
    "UPDATE customers SET balance_cop = balance_cop - ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?"
  ).bind(totalCop, customer_id).run();

  const payment = await db.prepare("SELECT * FROM payments WHERE id = ?").bind(result.meta.last_row_id).first();
  return c.json(payment);
});

app.delete("/api/payments/:id", async (c) => {
  const db = c.env.DB;
  const id = c.req.param("id");

  const payment: any = await db.prepare("SELECT * FROM payments WHERE id = ?").bind(id).first();
  const totalCop = payment.amount_cop + Math.round(payment.amount_ves / payment.exchange_rate);

  await db.prepare(
    "UPDATE customers SET balance_cop = balance_cop + ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?"
  ).bind(totalCop, payment.customer_id).run();

  await db.prepare("DELETE FROM payments WHERE id = ?").bind(id).run();
  return c.json({ success: true });
});

export default app;
