-- Myntra-Lite schema. Store facts, compute answers:
-- no suggested_size, average_rating, order_total or conversion columns anywhere.
-- Fit Twin works out a size from reviews + your size profile on every request.

CREATE TABLE products (
  id          TEXT PRIMARY KEY,
  gender      TEXT NOT NULL CHECK (gender IN ('men','women')),
  department  TEXT NOT NULL CHECK (department IN ('men','women','footwear')),
  sub         TEXT NOT NULL,
  brand       TEXT NOT NULL,
  name        TEXT NOT NULL,
  price       INTEGER NOT NULL CHECK (price > 0),
  size_system TEXT NOT NULL CHECK (size_system IN ('top','waist','shoe')),
  photo       TEXT NOT NULL,
  colour      TEXT NOT NULL
);

-- Every review carries the reviewer's build, so "buyers like you" can be found.
CREATE TABLE reviews (
  id          SERIAL PRIMARY KEY,
  product_id  TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  height_cm   INTEGER NOT NULL CHECK (height_cm BETWEEN 140 AND 200),
  build       TEXT NOT NULL CHECK (build IN ('slim','regular','broad')),
  usual_size  TEXT NOT NULL,
  kept_size   TEXT NOT NULL,
  fit         TEXT NOT NULL CHECK (fit IN ('small','true','large')),
  rating      INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  body        TEXT NOT NULL,
  has_photo   BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX reviews_product ON reviews(product_id);

CREATE TABLE users (
  id         SERIAL PRIMARY KEY,
  name       TEXT NOT NULL,
  username   TEXT UNIQUE,              -- demo login name; NULL for guests
  phone      TEXT UNIQUE,              -- unused since the demo login change
  is_guest   BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE sessions (
  token      TEXT PRIMARY KEY,
  user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- "Size Details" in the profile.
CREATE TABLE size_profiles (
  user_id    INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  height_cm  INTEGER NOT NULL CHECK (height_cm BETWEEN 140 AND 200),
  build      TEXT NOT NULL CHECK (build IN ('slim','regular','broad')),
  top_size   TEXT NOT NULL,
  waist      TEXT NOT NULL,
  shoe       TEXT NOT NULL,
  fit_pref   TEXT NOT NULL CHECK (fit_pref IN ('snug','regular','relaxed')),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE wishlist_items (
  user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL REFERENCES products(id),
  added_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, product_id)
);

CREATE TABLE bag_items (
  user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL REFERENCES products(id),
  size       TEXT NOT NULL,
  qty        INTEGER NOT NULL CHECK (qty BETWEEN 1 AND 5),
  added_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, product_id)
);

CREATE TABLE addresses (
  id       SERIAL PRIMARY KEY,
  user_id  INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name     TEXT NOT NULL,
  line     TEXT NOT NULL,
  city     TEXT NOT NULL,
  pin      TEXT NOT NULL,
  kind     TEXT NOT NULL DEFAULT 'Home'
);

-- Orders copy the address and item details at order time (facts); totals are still computed.
CREATE TABLE orders (
  id             SERIAL PRIMARY KEY,
  user_id        INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  ship_name      TEXT NOT NULL,
  ship_line      TEXT NOT NULL,
  ship_city      TEXT NOT NULL,
  ship_pin       TEXT NOT NULL,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('cod','upi','card','netbanking')),
  delivery_fee   INTEGER NOT NULL DEFAULT 0,
  placed_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE order_items (
  order_id        INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id      TEXT NOT NULL REFERENCES products(id),
  brand           TEXT NOT NULL,
  name            TEXT NOT NULL,
  price           INTEGER NOT NULL,
  size            TEXT NOT NULL,
  qty             INTEGER NOT NULL,
  -- what Fit Twin showed the buyer at that moment (a fact about the screen, used for the test results)
  shown_suggested TEXT,
  from_wishlist   BOOLEAN NOT NULL DEFAULT FALSE,
  PRIMARY KEY (order_id, product_id)
);

-- What testers did, for the prototype results page.
CREATE TABLE events (
  id         SERIAL PRIMARY KEY,
  user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL REFERENCES products(id),
  action     TEXT NOT NULL CHECK (action IN ('wishlisted','unwishlisted','added_to_bag','unsure','not_for_me','ordered')),
  size       TEXT,
  shown_suggested TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE notes (
  id         SERIAL PRIMARY KEY,
  user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL REFERENCES products(id),
  body       TEXT NOT NULL CHECK (length(body) BETWEEN 1 AND 300),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
