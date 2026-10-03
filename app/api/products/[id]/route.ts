// GET /api/products/:id - product page data: Fit Twin detail, review summary, reviews (buyers like you first), similar items.
import { currentUser } from "@/lib/auth";
import { productDetail } from "@/lib/catalog";
import { fail, ok } from "@/lib/http";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await currentUser();
  const product = await productDetail(id, user?.id ?? null);
  if (!product) return fail(404, "That product does not exist.");
  return ok(product);
}
