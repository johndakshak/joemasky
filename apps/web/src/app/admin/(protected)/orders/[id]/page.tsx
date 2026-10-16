import Link from "next/link";
import { AdminShell } from "@/components/admin/AdminShell";

interface AdminOrderDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminOrderDetailPage({
  params,
}: AdminOrderDetailPageProps) {
  const { id } = await params;

  return (
    <AdminShell>
      <div className="p-6 md:p-10">

        {/* Back link */}
        <Link
          href="/admin/orders"
          className="inline-flex items-center gap-1.5 font-barlow text-warmgray
                     hover:text-gold transition-colors mb-6"
          style={{ fontSize: "0.8rem", letterSpacing: "0.05em" }}
        >
          <svg
            className="w-3.5 h-3.5 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.8}
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path d="M15 18l-6-6 6-6" />
          </svg>
          Back to Orders
        </Link>

        {/* Page heading */}
        <div className="mb-8">
          <h1
            className="font-bebas tracking-wider text-charcoal leading-none"
            style={{ fontSize: "2rem" }}
          >
            Order Details
          </h1>
          <p
            className="font-barlow font-light text-warmgray mt-1"
            style={{ fontSize: "0.8rem", letterSpacing: "0.08em" }}
          >
            Order ID: {id}
          </p>
        </div>

        {/* Placeholder card */}
        <div className="bg-white border border-charcoal/[.06] p-8 max-w-xl">
          <h2
            className="font-bebas tracking-wider text-charcoal mb-3"
            style={{ fontSize: "1.6rem" }}
          >
            Full Order Detail
          </h2>
          <p
            className="font-barlow font-light text-warmgray mb-5"
            style={{ fontSize: "0.875rem" }}
          >
            Detailed order management — including item status, customer
            information, and fulfilment actions — will be implemented in the
            order-management phase.
          </p>
          <ul className="space-y-2">
            {[
              "View ordered items and quantities",
              "Confirm or adjust item availability",
              "Update order status",
              "View customer contact details",
              "Delivery or pickup details",
            ].map((item) => (
              <li
                key={item}
                className="font-barlow font-light text-warmgray flex items-start gap-2"
                style={{ fontSize: "0.82rem" }}
              >
                <span style={{ color: "var(--gold)", marginTop: "2px" }}>
                  •
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>

      </div>
    </AdminShell>
  );
}
