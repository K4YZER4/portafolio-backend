import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Request, Response } from "express";
import { RateLimitError } from "../../errors";

interface Bucket {
  tokens: number;
  lastRefill: number;
}

@Injectable()
export class TokenBucketGuard implements CanActivate {
  private static readonly buckets = new Map<string, Bucket>();
  private readonly tokensPerMinute = 40;
  private readonly capacity = 80;

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();
    const forwardedFor = request.header("x-forwarded-for");
    const clientIp = forwardedFor?.split(",")[0]?.trim() ?? request.ip ?? "unknown";
    const now = Date.now();
    const previous = TokenBucketGuard.buckets.get(clientIp) ?? {
      tokens: this.capacity,
      lastRefill: now,
    };
    const refillRate = this.tokensPerMinute / 60_000;
    const elapsed = now - previous.lastRefill;
    previous.tokens = Math.min(this.capacity, previous.tokens + elapsed * refillRate);
    previous.lastRefill = now;

    if (previous.tokens < 1) {
      const seconds = Math.ceil((1 - previous.tokens) / refillRate / 1000);
      throw new RateLimitError(seconds);
    }

    previous.tokens -= 1;
    TokenBucketGuard.buckets.set(clientIp, previous);
    response.setHeader("X-RateLimit-Remaining", Math.floor(previous.tokens));
    response.setHeader("X-RateLimit-Limit", this.capacity);
    return true;
  }
}
