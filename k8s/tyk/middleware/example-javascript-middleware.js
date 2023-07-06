var exampleJavaScriptMiddlewarePreHook = new TykJS.TykMiddleware.NewMiddleware({});

exampleJavaScriptMiddlewarePreHook.NewProcessRequest(function(request, session) {
    // You can log to Tyk console output by calling the built-in log() function:
    log("Hello from the Tyk JavaScript middleware pre hook function")
    
    // Add a request headers
    request.SetHeaders["Hello"] = "World";

    // You must return both the request and session metadata 
    return exampleJavaScriptMiddlewarePreHook.ReturnData(request, {}  );
});