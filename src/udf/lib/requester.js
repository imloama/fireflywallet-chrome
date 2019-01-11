import { logMessage } from './helpers';
import { FFWAPI } from './firefly';
var Requester = /** @class */ (function () {
    // private _headers: HeadersInit | undefined;
    function Requester(headers) {
        // if (headers) {
        // 	this._headers = headers;
        // }
    }
    Requester.prototype.sendRequest = function (datafeedUrl, urlPath, params) {
        // if (params !== undefined) {
        // 	const paramKeys = Object.keys(params);
        // 	if (paramKeys.length !== 0) {
        // 		urlPath += '?';
        // 	}
        // 	urlPath += paramKeys.map((key: string) => {
        // 		return `${encodeURIComponent(key)}=${encodeURIComponent(params[key].toString())}`;
        // 	}).join('&');
        // }
        logMessage('New request: ' + urlPath);
        var service = new FFWAPI(datafeedUrl, params);
        return service.handle(urlPath);
        // Send user cookies if the URL is on the same origin as the calling script.
        // const options: RequestInit = { credentials: 'same-origin' };
        // if (this._headers !== undefined) {
        // 	options.headers = this._headers;
        // }
        // return fetch(`${datafeedUrl}/${urlPath}`, options)
        // 	.then((response: Response) => response.text())
        // 	.then((responseTest: string) => JSON.parse(responseTest));
    };
    return Requester;
}());
export { Requester };
