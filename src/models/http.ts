import { AxiosRequestConfig } from 'axios';

export type AxiosRequestConfigWithMetadata = AxiosRequestConfig & {
  metadata?: {
    retryNumber?: number;
    startTime?: Date;
    endTime?: Date;
    refreshRetryAttempted?: boolean;
    correlationId?: string;
    duration?: number;
    [key: string]: unknown | undefined;
  };
};

export enum HttpMethod {
  Get = 'GET',
  Post = 'POST',
  Patch = 'PATCH',
  Delete = 'DELETE',
  Put = 'PUT',
  Options = 'OPTIONS',
  Head = 'HEAD'
}

export enum HttpStatusCode {
  /**
   * Equivalent to HTTP status 100. HttpStatusCode.Continue indicates that the client can continue with its request.
   */
  Continue = 100,
  /**
   * Equivalent to HTTP status 101. HttpStatusCode.SwitchingProtocols indicates
   * that the protocol version or protocol is being changed.
   */
  SwitchingProtocols = 101,
  /**
   * Equivalent to HTTP status 102. HttpStatusCode.Processing indicates
   * that the server has accepted the complete request but hasn't completed it yet.
   */
  Processing = 102,
  /**
   * Equivalent to HTTP status 103. HttpStatusCode.EarlyHints indicates
   * to the client that the server is likely to send a final response with the header
   * fields included in the informational response.
   */
  EarlyHints = 103,
  /**
   * Equivalent to HTTP status 200. HttpStatusCode.OK indicates that the
   * request succeeded and that the requested information is in the response. This
   * is the most common status code to receive.
   */
  OK = 200,
  /**
   * Equivalent to HTTP status 201. HttpStatusCode.Created indicates that
   * the request resulted in a new resource created before the response was sent.
   */
  Created = 201,
  /**
   * Equivalent to HTTP status 202. HttpStatusCode.Accepted indicates that
   * the request has been accepted for further processing.
   */
  Accepted = 202,
  /**
   * Equivalent to HTTP status 203. HttpStatusCode.NonAuthoritativeInformation
   * indicates that the returned metainformation is from a cached copy instead of
   * the origin server and therefore may be incorrect.
   */
  NonAuthoritativeInformation = 203,
  /**
   * Equivalent to HTTP status 204. HttpStatusCode.NoContent indicates
   * that the request has been successfully processed and that the response is intentionally
   * blank.
   */
  NoContent = 204,
  /**
   * Equivalent to HTTP status 205. HttpStatusCode.ResetContent indicates
   * that the client should reset (not reload) the current resource.
   */
  ResetContent = 205,
  /**
   * Equivalent to HTTP status 206. HttpStatusCode.PartialContent indicates
   * that the response is a partial response as requested by a GET request that includes
   * a byte range.
   */
  PartialContent = 206,
  /**
   * Equivalent to HTTP status 207. HttpStatusCode.MultiStatus indicates
   * multiple status codes for a single response during a Web Distributed Authoring
   * and Versioning (WebDAV) operation. The response body contains XML that describes
   * the status codes.
   */
  MultiStatus = 207,
  /**
   * Equivalent to HTTP status 208. HttpStatusCode.AlreadyReported indicates
   * that the members of a WebDAV binding have already been enumerated in a preceding
   * part of the multistatus response, and are not being included again.
   */
  AlreadyReported = 208,
  /**
   * Equivalent to HTTP status 226. HttpStatusCode.IMUsed indicates that
   * the server has fulfilled a request for the resource, and the response is a representation
   * of the result of one or more instance-manipulations applied to the current instance.
   */
  IMUsed = 226,
  /**
   * Equivalent to HTTP status 300. HttpStatusCode.Ambiguous indicates
   * that the requested information has multiple representations. The default action
   * is to treat this status as a redirect and follow the contents of the Location
   * header associated with this response. Ambiguous is a synonym for MultipleChoices.
   */
  Ambiguous = 300,
  /**
   * Equivalent to HTTP status 300. HttpStatusCode.MultipleChoices indicates
   * that the requested information has multiple representations. The default action
   * is to treat this status as a redirect and follow the contents of the Location
   * header associated with this response. MultipleChoices is a synonym for Ambiguous.
   */
  MultipleChoices = 300,
  /**
   * Equivalent to HTTP status 301. HttpStatusCode.Moved indicates that
   * the requested information has been moved to the URI specified in the Location
   * header. The default action when this status is received is to follow the Location
   * header associated with the response. When the original request method was POST,
   * the redirected request will use the GET method. Moved is a synonym for MovedPermanently.
   */
  Moved = 301,
  /**
   * Equivalent to HTTP status 301. HttpStatusCode.MovedPermanently indicates
   * that the requested information has been moved to the URI specified in the Location
   * header. The default action when this status is received is to follow the Location
   * header associated with the response. MovedPermanently is a synonym for Moved.
   */
  MovedPermanently = 301,
  /**
   * Equivalent to HTTP status 302. HttpStatusCode.Found indicates that
   * the requested information is located at the URI specified in the Location header.
   * The default action when this status is received is to follow the Location header
   * associated with the response. When the original request method was POST, the
   * redirected request will use the GET method. Found is a synonym for Redirect.
   */
  Found = 302,
  /**
   * Equivalent to HTTP status 302. HttpStatusCode.Redirect indicates that
   * the requested information is located at the URI specified in the Location header.
   * The default action when this status is received is to follow the Location header
   * associated with the response. When the original request method was POST, the
   * redirected request will use the GET method. Redirect is a synonym for Found.
   */
  Redirect = 302,
  /**
   * Equivalent to HTTP status 303. HttpStatusCode.RedirectMethod automatically
   * redirects the client to the URI specified in the Location header as the result
   * of a POST. The request to the resource specified by the Location header will
   * be made with a GET. RedirectMethod is a synonym for SeeOther.
   */
  RedirectMethod = 303,
  /**
   * Equivalent to HTTP status 303. HttpStatusCode.SeeOther automatically
   * redirects the client to the URI specified in the Location header as the result
   * of a POST. The request to the resource specified by the Location header will
   * be made with a GET. SeeOther is a synonym for RedirectMethod
   */
  SeeOther = 303,
  /**
   * Equivalent to HTTP status 304. HttpStatusCode.NotModified indicates
   * that the client's cached copy is up to date. The contents of the resource are
   * not transferred.
   */
  NotModified = 304,
  /**
   * Equivalent to HTTP status 305. HttpStatusCode.UseProxy indicates that
   * the request should use the proxy server at the URI specified in the Location
   * header.
   */
  UseProxy = 305,
  /**
   * Equivalent to HTTP status 306. HttpStatusCode.Unused is a proposed
   * extension to the HTTP/1.1 specification that is not fully specified.
   */
  Unused = 306,
  /**
   * Equivalent to HTTP status 307. HttpStatusCode.RedirectKeepVerb indicates
   * that the request information is located at the URI specified in the Location
   * header. The default action when this status is received is to follow the Location
   * header associated with the response. When the original request method was POST,
   * the redirected request will also use the POST method. RedirectKeepVerb is a synonym
   * for TemporaryRedirect.
   */
  RedirectKeepVerb = 307,
  /**
   * Equivalent to HTTP status 307. HttpStatusCode.TemporaryRedirect indicates
   * that the request information is located at the URI specified in the Location
   * header. The default action when this status is received is to follow the Location
   * header associated with the response. When the original request method was POST,
   * the redirected request will also use the POST method. TemporaryRedirect is a
   * synonym for RedirectKeepVerb.
   */
  TemporaryRedirect = 307,
  /**
   * Equivalent to HTTP status 308. HttpStatusCode.PermanentRedirect indicates
   * that the request information is located at the URI specified in the Location
   * header. The default action when this status is received is to follow the Location
   * header associated with the response. When the original request method was POST,
   * the redirected request will also use the POST method.
   */
  PermanentRedirect = 308,
  /**
   * Equivalent to HTTP status 400. HttpStatusCode.BadRequest indicates
   * that the request could not be understood by the server. HttpStatusCode.BadRequest
   * is sent when no other error is applicable, or if the exact error is unknown or
   * does not have its own error code.
   */
  BadRequest = 400,
  /**
   * Equivalent to HTTP status 401. HttpStatusCode.Unauthorized indicates
   * that the requested resource requires authentication. The WWW-Authenticate header
   * contains the details of how to perform the authentication.
   */
  Unauthorized = 401,
  /**
   * Equivalent to HTTP status 402. HttpStatusCode.PaymentRequired is reserved
   * for future use.
   */
  PaymentRequired = 402,
  /**
   * Equivalent to HTTP status 403. HttpStatusCode.Forbidden indicates
   * that the server refuses to fulfill the request.
   */
  Forbidden = 403,
  /**
   * Equivalent to HTTP status 404. HttpStatusCode.NotFound indicates that
   * the requested resource does not exist on the server.
   */
  NotFound = 404,
  /**
   * Equivalent to HTTP status 405. HttpStatusCode.MethodNotAllowed indicates
   * that the request method (POST or GET) is not allowed on the requested resource.
   */
  MethodNotAllowed = 405,
  /**
   * Equivalent to HTTP status 406. HttpStatusCode.NotAcceptable indicates
   * that the client has indicated with Accept headers that it will not accept any
   * of the available representations of the resource.
   */
  NotAcceptable = 406,
  /**
   * Equivalent to HTTP status 407. HttpStatusCode.ProxyAuthenticationRequired
   * indicates that the requested proxy requires authentication. The Proxy-authenticate
   * header contains the details of how to perform the authentication.
   */
  ProxyAuthenticationRequired = 407,
  /**
   * Equivalent to HTTP status 408. HttpStatusCode.RequestTimeout indicates
   * that the client did not send a request within the time the server was expecting
   * the request.
   */
  RequestTimeout = 408,
  /**
   * Equivalent to HTTP status 409. HttpStatusCode.Conflict indicates that
   * the request could not be carried out because of a conflict on the server.
   */
  Conflict = 409,
  /**
   * Equivalent to HTTP status 410. HttpStatusCode.Gone indicates that
   * the requested resource is no longer available.
   */
  Gone = 410,
  /**
   * Equivalent to HTTP status 411. HttpStatusCode.LengthRequired indicates
   * that the required Content-length header is missing.
   */
  LengthRequired = 411,
  /**
   * Equivalent to HTTP status 412. HttpStatusCode.PreconditionFailed indicates
   * that a condition set for this request failed, and the request cannot be carried
   * out. Conditions are set with conditional request headers like If-Match, If-None-Match,
   * or If-Unmodified-Since.
   */
  PreconditionFailed = 412,
  /**
   * Equivalent to HTTP status 413. HttpStatusCode.RequestEntityTooLarge
   * indicates that the request is too large for the server to process.
   */
  RequestEntityTooLarge = 413,
  /**
   * Equivalent to HTTP status 414. HttpStatusCode.RequestUriTooLong indicates
   * that the URI is too long.
   */
  RequestUriTooLong = 414,
  /**
   * Equivalent to HTTP status 415. HttpStatusCode.UnsupportedMediaType
   * indicates that the request is an unsupported type.
   */
  UnsupportedMediaType = 415,
  /**
   * Equivalent to HTTP status 416. HttpStatusCode.RequestedRangeNotSatisfiable
   * indicates that the range of data requested from the resource cannot be returned,
   * either because the beginning of the range is before the beginning of the resource,
   * or the end of the range is after the end of the resource.
   */
  RequestedRangeNotSatisfiable = 416,
  /**
   * Equivalent to HTTP status 417. HttpStatusCode.ExpectationFailed indicates
   * that an expectation given in an Expect header could not be met by the server.
   */
  ExpectationFailed = 417,
  /**
   * Client error response code indicates that the server refuses to brew coffee because it is, permanently, a teapot.
   * A combined coffee/tea pot that is temporarily out of coffee should instead return 503.
   */
  IAmATeapot = 418,
  /**
   * Equivalent to HTTP status 421. HttpStatusCode.MisdirectedRequest indicates
   * that the request was directed at a server that is not able to produce a response.
   */
  MisdirectedRequest = 421,
  /**
   * Equivalent to HTTP status 422. HttpStatusCode.UnprocessableEntity
   * indicates that the request was well-formed but was unable to be followed due
   * to semantic errors.
   */
  UnprocessableEntity = 422,
  /**
   * Equivalent to HTTP status 423. HttpStatusCode.Locked indicates that
   * the source or destination resource is locked.
   */
  Locked = 423,
  /**
   * Equivalent to HTTP status 424. HttpStatusCode.FailedDependency indicates
   * that the method couldn't be performed on the resource because the requested action
   * depended on another action and that action failed.
   */
  FailedDependency = 424,
  /**
   * Equivalent to HTTP status 426. HttpStatusCode.UpgradeRequired indicates
   * that the client should switch to a different protocol such as TLS/1.0.
   */
  UpgradeRequired = 426,
  /**
   * Equivalent to HTTP status 428. HttpStatusCode.PreconditionRequired
   * indicates that the server requires the request to be conditional.
   */
  PreconditionRequired = 428,
  /**
   * Equivalent to HTTP status 429. HttpStatusCode.TooManyRequests indicates
   * that the user has sent too many requests in a given amount of time.
   */
  TooManyRequests = 429,
  /**
   * Equivalent to HTTP status 431. HttpStatusCode.RequestHeaderFieldsTooLarge
   * indicates that the server is unwilling to process the request because its header
   * fields (either an individual header field or all the header fields collectively)
   * are too large.
   */
  RequestHeaderFieldsTooLarge = 431,
  /**
   * Equivalent to HTTP status 451. HttpStatusCode.UnavailableForLegalReasons
   * indicates that the server is denying access to the resource as a consequence
   * of a legal demand.
   */
  UnavailableForLegalReasons = 451,
  /**
   * Equivalent to HTTP status 500. HttpStatusCode.InternalServerError
   * indicates that a generic error has occurred on the server.
   */
  InternalServerError = 500,
  /**
   * Equivalent to HTTP status 501. HttpStatusCode.NotImplemented indicates
   * that the server does not support the requested function.
   */
  NotImplemented = 501,
  /**
   * Equivalent to HTTP status 502. HttpStatusCode.BadGateway indicates
   * that an intermediate proxy server received a bad response from another proxy
   * or the origin server.
   */
  BadGateway = 502,
  /**
   * Equivalent to HTTP status 503. HttpStatusCode.ServiceUnavailable indicates
   * that the server is temporarily unavailable, usually due to high load or maintenance.
   */
  ServiceUnavailable = 503,
  /**
   * Equivalent to HTTP status 504. HttpStatusCode.GatewayTimeout indicates
   * that an intermediate proxy server timed out while waiting for a response from
   * another proxy or the origin server.
   */
  GatewayTimeout = 504,
  /**
   * Equivalent to HTTP status 505. HttpStatusCode.HttpVersionNotSupported
   * indicates that the requested HTTP version is not supported by the server.
   */
  HttpVersionNotSupported = 505,
  /**
   * Equivalent to HTTP status 506. HttpStatusCode.VariantAlsoNegotiates
   * indicates that the chosen variant resource is configured to engage in transparent
   * content negotiation itself and, therefore, isn't a proper endpoint in the negotiation
   * process.
   */
  VariantAlsoNegotiates = 506,
  /**
   * Equivalent to HTTP status 507. HttpStatusCode.InsufficientStorage
   * indicates that the server is unable to store the representation needed to complete
   * the request.
   */
  InsufficientStorage = 507,
  /**
   * Equivalent to HTTP status 508. HttpStatusCode.LoopDetected indicates
   * that the server terminated an operation because it encountered an infinite loop
   * while processing a WebDAV request with "Depth: infinity". This status code is
   * meant for backward compatibility with clients not aware of the 208 status code
   * HttpStatusCode.AlreadyReported appearing in multistatus response bodies.
   */
  LoopDetected = 508,
  /**
   * Equivalent to HTTP status 510. HttpStatusCode.NotExtended indicates
   * that further extensions to the request are required for the server to fulfill
   * it.
   */
  NotExtended = 510,
  /**
   * Equivalent to HTTP status 511. HttpStatusCode.NetworkAuthenticationRequired
   * indicates that the client needs to authenticate to gain network access; it's
   * intended for use by intercepting proxies used to control access to the network.
   */
  NetworkAuthenticationRequired = 511
}
