define([], function () {
    function command(command, callback) {
        jKSPWAPI.call("ret=" + command, function (result) {
            if(callback){
                callback(null, result.ret);
            }
        });
    }

    function toggle(command) {
        jKSPWAPI.call("ret=" + command, function (d) {
            if (d.ret > 0) {
                jKSPWAPI.generateNotificationWithCode(d.ret);
            }
        });
    }
    function custom(command, callback) {
        jKSPWAPI.call(command, function (result) {
            if(callback){
                callback(null, result);
            }
        });
    }
    return {
        command: command,
        toggle:toggle,
        custom:custom
    };
});