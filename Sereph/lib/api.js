define([], function () {
    function command(command) {
        jKSPWAPI.call("ret=" + command, function (d) {
            if (d.ret > 0) {
                jKSPWAPI.generateNotificationWithCode(d.ret);
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
    return {
        command: command,
        toggle:toggle
    };
});