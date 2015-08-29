define(['./api'], function (api) {
    return {
        stage: function () {
            api.command('f.stage');
        },
        throttle: {
            get: function (callback) {
                api.command('f.throttle', callback);
            },
            set: function (value) {
                api.command('f.setThrottle[' + value + ']');
            },
            up: function () {
                api.command('f.throttleUp');
            },
            down: function () {
                api.command('f.throttleDown');
            },
            full: function () {
                api.command('f.throttleFull');
            },
            cut: function () {
                api.command('f.throttleZero');
            }
        },
        attitude: {
            pitch: {
                set: function (value) {
                    api.command('v.setPitch[' + value + ']');
                }
            },
            roll: {
                set: function (value) {
                    api.command('v.setRoll[' + value + ']');
                }
            },
            yaw: {
                set: function (value) {
                    api.command('v.setYaw[' + value + ']');
                }
            },
            set: function (pitch, yaw, roll) {
                api.command('v.setAttitude[' + pitch + ',' + yaw + ',' + roll + ']');
            },
            setTranslastion: function (x, y, z) {
                api.command('v.setTranslation[' + x + ',' + y + ',' + z + ']');
            },
            flyByWire: {
                on: function () {
                    api.command('v.setFbW[1]');
                },
                off: function () {
                    api.command('v.setFbW[0]');
                }
            }
        },
        avionics: {
            rcs: {
                toggle: function () {
                    api.toggle('f.rcs');
                },
                on: function () {
                    api.toggle('f.rcs[true]');
                },
                off: function () {
                    api.toggle('f.rcs[false]');
                },
                get: function (callback) {
                    api.command('v.rcsValue', callback);
                }
            },
            sas: {
                toggle: function () {
                    api.toggle('f.sas');
                },
                on: function () {
                    api.toggle('f.sas[true]');
                },
                off: function () {
                    api.toggle('f.sas[false]');
                },
                get: function (callback) {
                    api.command('v.sasValue', callback);
                }
            },
            lights: {
                toggle: function () {
                    api.toggle('f.light');
                },
                on: function () {
                    api.toggle('f.light[true]');
                },
                off: function () {
                    api.toggle('f.light[false]');
                },
                get: function (callback) {
                    api.command('v.lightValue', callback);
                }
            },
            landingGear: {
                toggle: function () {
                    api.toggle('f.gear');
                },
                down: function () {
                    api.toggle('f.gear[true]');
                },
                up: function () {
                    api.toggle('f.gear[false]');
                },
                get: function (callback) {
                    api.command('v.gearValue', callback);
                }
            },
            breaks: {
                toggle: function () {
                    api.toggle('f.brake');
                },
                on: function () {
                    api.toggle('f.brake[true]');
                },
                off: function () {
                    api.toggle('f.brake[false]');
                },
                get: function (callback) {
                    api.command('v.brakeValue', callback);
                }
            }
        },
        abort: function () {
            api.toggle('f.abort');
        },
        actionGroups: {
            1: function () {
                api.toggle('f.ag1');
            },
            2: function () {
                api.toggle('f.ag2');
            },
            3: function () {
                api.toggle('f.ag3');
            },
            4: function () {
                api.toggle('f.ag4');
            },
            5: function () {
                api.toggle('f.ag5');
            },
            6: function () {
                api.toggle('f.ag6');
            },
            7: function () {
                api.toggle('f.ag7');
            },
            8: function () {
                api.toggle('f.ag8');
            },
            9: function () {
                api.toggle('f.ag9');
            },
            10: function () {
                api.toggle('f.ag10');
            }
        }
    }
});