const { app, BrowserWindow } = require('electron');
const { EOL } = require("os");

exports.decorateConfig = config => {
    const DEFAULT_CONFIG = {
        favorites: []
    };

    const css = {
        css: `
            ${config.css || ''}

            .term_fit {
                padding-bottom: 34px !important;
            }

            .favorites_footer {
                box-sizing: border-box;
                position: absolute;
                bottom: 0;
                height: 34px;
                left: 0;
                width: 100%;
                border-top: 1px solid ${config.borderColor};
                padding: 4px;
                display: flex;
            }

            .favorites_button {
                padding: 0 10px;
                margin-right: 5px;
                background: ${config.borderColor};
                color: ${config.foregroundColor};
                transition: 0.1s background;
                border: none;
                outline: none;
                border-radius: 12px;
            }
        `
    };

    return Object.assign({}, DEFAULT_CONFIG, config, css);
};

exports.decorateTerm = (Term, { React }) => {
    class Favorites extends React.Component {
        constructor(props) {
            super(props);
        }

        render() {

            return React.createElement(
                'footer',
                { className: 'favorites_footer' },
                this.props.favorites.map((fav, i) => {
                    return React.createElement(
                        'button',
                        { className: 'favorites_button', 'data-index': i, onClick: this.props.onClick },
                        fav.name
                    );
                })
            );
        }
    }

    return class extends React.Component {
        constructor(props, context) {
            super(props, context);

            this._onTerminal = this._onTerminal.bind(this);
            this.onFavoritesClick = this.onFavoritesClick.bind(this);
        }

        _onTerminal(term) {
            if (this.props && this.props.onTerminal) this.props.onTerminal(term);
            this._term = term;
        }

        onFavoritesClick(e) {
            const index = e.target.dataset.index;
            this.props.term.div_.focus();

            if (this._term && index) {
                const favItem = this.props.favorites[index];
                const cmd = Array.isArray(favItem.cmd) ? favItem.cmd.join(EOL) : favItem.cmd;
                this._term.keyboard.terminal.io.sendString(`${cmd}${EOL}`);
            }
        }

        render() {
            const { favorites } = this.props;

            if (favorites.length === 0) {
                return React.createElement(Term, this.props);
            }

            const newProps = Object.assign({}, this.props, {
                onTerminal: this._onTerminal,
                customChildren: React.createElement(Favorites, { favorites: favorites, onClick: this.onFavoritesClick })
            });

            return React.createElement(Term, newProps);
        }
    };
};

exports.mapTermsState = (state, map) => {
    return Object.assign(map, { favorites: state.ui.favorites });
};

function passProps(uid, parentProps, props) {
    return Object.assign({}, props, {
        favorites: parentProps.favorites
    });
}

exports.getTermGroupProps = passProps;
exports.getTermProps = passProps;

exports.middleware = store => next => action => {
    const { type, config: { favorites } = {} } = action;

    if (type === 'CONFIG_LOAD' || type === 'CONFIG_RELOAD') {
        store.dispatch({
            type: 'FAVORITES_UPDATE',
            favorites
        });
    }

    next(action);
};

exports.reduceUI = (state, { type, favorites }) => {
    if (type === 'FAVORITES_UPDATE') {
        return state.set('favorites', favorites);
    }

    return state;
};
