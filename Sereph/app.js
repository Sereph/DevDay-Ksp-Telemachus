(function () {
    requirejs.config({
        baseUrl: 'lib',
        paths: {
            app: 'app'
        }
    });

    requirejs(['./auto-pilot-launcher'],function(autoPilotLauncher){
        console.log("hiya");
        console.log(autoPilotLauncher);
    });
})();