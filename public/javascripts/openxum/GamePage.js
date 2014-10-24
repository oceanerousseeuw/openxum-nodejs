"use strict";

OpenXum.GamePage = function (namespace, n, c, oc, gt, gi, u, oi, opi, r) {
// private attributes
    var canvas;
    var canvas_div;
    var engine;
    var gui;
    var manager;
    var opponent;

// private methods
    var build_engine = function (namespace) {
        engine = new namespace.Engine(0, 0);
    };

    var build_gui = function (namespace, color, game_id) {
        gui = new namespace.Gui(color, engine, game_id === '-1');
    };

    var build_opponent = function (namespace, game_type, game_id, opponent_color, owner_id, opponent_id) {
        if (game_type === 'remote_ai') {
            opponent = new namespace.RestWebServicePlayer(opponent_color, engine, username);
            opponent.set_url('http://127.0.0.1/openxum-ws-php/index.php/');
        } else if (game_type === 'gui') {
            opponent = gui;
        } else if (game_type === 'ai') {
            if (engine.get_possible_move_list) {
                opponent = new OpenXum.MCTSPlayer(opponent_color, engine);
            } else {
                opponent = new namespace.RandomPlayer(opponent_color, engine);
            }
        } else {
            opponent = new namespace.RemotePlayer(opponent_color, engine, owner_id, opponent_id, game_id);
        }
    };

    var build_manager = function (namespace) {
        manager = new namespace.Manager(engine, gui, opponent, new OpenXum.Status(document.getElementById("status")));
    };

    var set_gui = function () {
        canvas = document.getElementById("board");
        canvas_div = document.getElementById("boardDiv");
        if (canvas_div.clientHeight < canvas_div.clientWidth) {
            canvas.height = canvas_div.clientHeight * 0.95;
            canvas.width = canvas_div.clientHeight * 0.95;
        } else {
            canvas.height = canvas_div.clientWidth * 0.95;
            canvas.width = canvas_div.clientWidth * 0.95;
        }
        gui.set_canvas(canvas);
        gui.set_manager(manager);
    };

    var set_opponent = function (game_id) {
        if (game_id !== '-1') {
            opponent.set_manager(manager);
            opponent.set_gui(gui);
        } else {
            if (opponent !== gui) {
                opponent.set_level(manager.load_level())
            }
            if (opponent.is_remote()) {
                opponent.set_manager(manager);
            }
        }
    };

    var init = function (namespace, name, color, opponent_color, game_type, game_id, username, owner_id, opponent_id, replay) {
        $('#winnerModal .new-game-button').click(function () {
            $('#winnerModal').modal('hide');
            window.location.href = '/games/play/?game=' + name;
        });

        build_engine(namespace);
        build_gui(namespace, color, game_id);
        build_opponent(namespace, game_type, game_id, opponent_color, owner_id, opponent_id);
        build_manager(namespace);
        set_gui();
        set_opponent(game_id);

        if (opponent !== gui && engine.current_color() === opponent.color() && !opponent.is_remote()) {
            manager.play_other();
        }
        if (replay === true) {
            opponent.replay_game();
        }
        $("#replay").click(function () {
            opponent.replay_game();
        });
    };

    init(namespace, n, c, oc, gt, gi, u, oi, opi, r);
};