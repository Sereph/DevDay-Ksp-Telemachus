define(['./api'], function (api) {
    function stage() {
        api.command('f.stage');
    }

    function throttleUp() {
        api.command('f.throttleUp');
    }

    function throttleDown() {
        api.command('f.throttleDown');
    }

    function throttleZero() {
        api.command('f.throttleZero');
    }

    function throttleFull() {
        api.command('f.throttleFull');
    }

    function rcsToggle() {
        api.toggle('f.rcs');
    }

    function rcsOn() {
        api.toggle('f.rcs[true]');
    }

    function rcsOff() {
        api.toggle('f.rcs[false]');
    }

    function getRcs(callback) {
        api.command('v.rcsValue', callback);
    }

    function sasToggle() {
        api.toggle('f.sas');
    }

    function sasOn() {
        api.toggle('f.sas[true]');
    }

    function sasOff() {
        api.toggle('f.sas[false]');
    }

    function getSas(callback) {
        api.command('v.sasValue', callback);
    }

    function lightsToggle() {
        api.toggle('f.light');
    }

    function lightsOn() {
        api.toggle('f.light[true]');
    }

    function lightsOff() {
        api.toggle('f.light[false]');
    }

    function getLights(callback) {
        api.command('v.lightValue', callback);
    }

    function landingGearToggle() {
        api.toggle('f.gear');
    }

    function landingGearDown() {
        api.toggle('f.gear[true]');
    }

    function landingGearUp() {
        api.toggle('f.gear[false]');
    }

    function getLandingGear(callback) {
        api.command('v.gearValue', callback);
    }

    function toggleBreaks() {
        api.toggle('f.brake');
    }

    function breaksOn() {
        api.toggle('f.brake[true]');
    }

    function breaksOff() {
        api.toggle('f.brake[false]');
    }

    function getBreaks(callback) {
        api.command('v.brakeValue', callback);
    }

    function abort() {
        api.toggle('f.abort');
    }

    function actionGroup1() {
        api.toggle('f.ag1');
    }

    function actionGroup2() {
        api.toggle('f.ag2');
    }

    function actionGroup3() {
        api.toggle('f.ag3');
    }

    function actionGroup4() {
        api.toggle('f.ag4');
    }

    function actionGroup5() {
        api.toggle('f.ag5');
    }

    function actionGroup6() {
        api.toggle('f.ag6');
    }

    function actionGroup7() {
        api.toggle('f.ag7');
    }

    function actionGroup8() {
        api.toggle('f.ag8');
    }

    function actionGroup9() {
        api.toggle('f.ag9');
    }

    function actionGroup10() {
        api.toggle('f.ag10');
    }

    return {
        stage: stage,
        throttle: {
            up: throttleUp,
            down: throttleDown,
            full: throttleFull,
            cut: throttleZero
        },
        avionics: {
            rcs: {
                toggle: rcsToggle,
                on: rcsOn,
                off: rcsOff,
                get: getRcs
            },
            sas: {
                toggle: sasToggle,
                on: sasOn,
                off: sasOff,
                get: getSas
            },
            lights: {
                toggle: lightsToggle,
                on: lightsOn,
                off: lightsOff,
                get: getLights
            },
            landingGear: {
                toggle: landingGearToggle,
                down: landingGearDown,
                up: landingGearUp,
                get: getLandingGear
            },
            breaks: {
                toggle: toggleBreaks,
                on: breaksOn,
                off: breaksOff,
                get: getBreaks
            }
        },
        actionGroups: {
            1: actionGroup1,
            2: actionGroup2,
            3: actionGroup3,
            4: actionGroup4,
            5: actionGroup5,
            6: actionGroup6,
            7: actionGroup7,
            8: actionGroup8,
            9: actionGroup9,
            10: actionGroup10
        }
    }
});