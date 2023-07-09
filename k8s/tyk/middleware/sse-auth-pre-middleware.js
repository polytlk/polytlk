var sseAuthMiddlewarePreHook = new TykJS.TykMiddleware.NewMiddleware({});

sseAuthMiddlewarePreHook.NewProcessRequest(function (request) {
    log("request: " +  JSON.stringify(request, null, 2))
    rawlog("-----")

    var qparams = request.Params["key"]|| ''

    if (!qparams) return sseAuthMiddlewarePreHook.ReturnData(request, {});
        
    log("qparams: " + JSON.stringify(qparams, null, 2));
    rawlog("-----");

    var auth = 'Bearer ' + qparams[0];

    log("auth: " + JSON.stringify(auth, null, 2));
    rawlog("-----");
    
    request.SetHeaders["Authorization"] = auth;

    return sseAuthMiddlewarePreHook.ReturnData(request, {});
});