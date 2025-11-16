import { HyperliquidError } from "../../../_base.ts";
import type { ErrorResponse } from "./_schemas.ts";
import type { CancelResponse } from "../cancel.ts";
import type { OrderResponse } from "../order.ts";
import type { TwapOrderResponse } from "../twapOrder.ts";
import type { TwapCancelResponse } from "../twapCancel.ts";
import type { AnyResponse, AnySuccessResponse } from "./_types.ts";

type AnyErrorResponse = ErrorResponse | CancelResponse | OrderResponse | TwapOrderResponse | TwapCancelResponse;

/** Thrown when Exchange API returns an error response (e.g., insufficient funds). */
export class ApiRequestError extends HyperliquidError {
  response: AnyErrorResponse;
  constructor(response: AnyErrorResponse) {
    let message;
    if (response.status === "err") {
      // ErrorResponse
      message = response.response;
    } else {
      if ("statuses" in response.response.data) {
        // OrderResponse | CancelResponse
        const errors = response.response.data.statuses.reduce<string[]>((acc, status, index) => {
          if (typeof status === "object" && "error" in status) {
            acc.push(`Order ${index}: ${status.error}`);
          }
          return acc;
        }, []);
        if (errors.length > 0) {
          message = errors.join(", ");
        }
      } else {
        // TwapOrderResponse | TwapCancelResponse
        if (typeof response.response.data.status === "object" && "error" in response.response.data.status) {
          message = response.response.data.status.error;
        }
      }
    }

    super(message || "An unknown error occurred while processing an API request. See `response` for more details.");
    this.name = "ApiRequestError";
    this.response = response;
  }
}

export function assertSuccessResponse(response: AnyResponse): asserts response is AnySuccessResponse {
  if (response.status === "err") {
    throw new ApiRequestError(response as ErrorResponse);
  } else if (response.response.type === "order" || response.response.type === "cancel") {
    if (response.response.data.statuses.some((status) => typeof status === "object" && "error" in status)) {
      throw new ApiRequestError(response as OrderResponse | CancelResponse);
    }
  } else if (response.response.type === "twapOrder" || response.response.type === "twapCancel") {
    if (typeof response.response.data.status === "object" && "error" in response.response.data.status) {
      throw new ApiRequestError(response as TwapOrderResponse | TwapCancelResponse);
    }
  }
}
