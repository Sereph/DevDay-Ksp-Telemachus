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

    function toggleRcs() {
        api.toggle('f.rcs');
    }

    function toggleSas() {
        api.toggle('f.sas');
    }

    function toggleLights() {
        api.toggle('f.light');
    }

    function toggleLandingGear() {
        api.toggle('f.gear');
    }

    function toggleBreaks() {
        api.toggle('f.brake');
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
                toggle: toggleRcs
            },
            sas: {
                toggle: toggleSas
            },
            lights: {
                toggle: toggleLights
            },
            landingGear: {
                toggle: toggleLandingGear
            },
            breaks: {
                toggle: toggleBreaks
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