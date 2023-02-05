import { ApplicationError } from "@/protocols";

type Entity = "ticket" | "remote" | "hotel";

export function paymentRequiredError(entity: Entity): ApplicationError {
  let message = "";
  if (entity === "ticket") message = "Ticket not paid";
  if (entity === "remote") message = "The ticket is remote";
  if (entity === "hotel") message = "Hotel not included";

  return {
    name: "PaymentRequiredError",
    message: message,
  };
}
