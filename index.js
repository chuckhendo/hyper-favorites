const { app, BrowserWindow } = require('electron');
const {EOL} = require("os");

exports.decorateConfig = (config) => {
    const DEFAULT_CONFIG = {
        favorites: []
    };

    const css = {
        css: `
            ${config.css || ''}

            .term_fit {
                padding-bottom: 34px !important;
            }
        `
    };

    return Object.assign({}, DEFAULT_CONFIG, config, css);
};

exports.decorateTerm = (Term, { React }) => {
    const styled = require('styled-components').default;

    const Footer = styled.footer`
        background-color: rgba(255, 255, 255, 0.15);
        border-top: 1px solid rgba(255, 255, 255, 0.18);
        bottom: 0;
        box-sizing: border-box;
        display: flex;
        height: 34px;
        left: 0;
        padding: 4px;
        position: absolute;
        width: 100%;
    `;

    const Button = styled.button`
        background: #000;
        border: none;
        border-radius: 2px;
        color: rgba(255, 255, 255, 0.3);
        cursor: pointer;
        font-size: 14px;
        margin-right: 5px;
        outline: none;
        padding: 0 10px;
        transition: 0.1s background, 0.1s color, 0.1s box-shadow;

        &:hover {
            background: rgba(255, 255, 255, 0.05);
            box-shadow: 1px 1px 3px #000;
            color: rgba(255, 255, 255, 0.5);
        }

        &:active {
            color: rgba(255, 255, 255, 0.4);
        }
    `;

    class Favorites extends React.Component {
        constructor (props) {
            super(props);
        }

        render () {
            
            return (
                <Footer>
                {this.props.favorites.map((fav, i) => {
                    return <Button value={i} onClick={this.props.onClick}>{fav.name}</Button>
                })}
                </Footer>
            );
        }
    }

    return class extends React.Component {
        constructor (props, context) {
            super(props, context);

            this._onTerminal = this._onTerminal.bind(this);
            this.onFavoritesClick = this.onFavoritesClick.bind(this);
        }

        _onTerminal (term) {
            if (this.props && this.props.onTerminal) this.props.onTerminal(term);
            this._term = term;
        }

        onFavoritesClick (e) {
            const index = e.target.value;

            if (this._term && index) {
                const favItem = this.props.favorites[index];
                const cmd = Array.isArray(favItem.cmd) ? favItem.cmd.join(EOL) : favItem.cmd;
                this._term.keyboard.terminal.io.sendString(`${cmd}${EOL}`);
            }
        }

        render () {
            const {favorites} = this.props;

            if (favorites.length === 0) {
                return <Term {...this.props} />
            }

            const newProps = Object.assign({}, this.props, {
                onTerminal: this._onTerminal,
                customChildren: <Favorites favorites={favorites} onClick={this.onFavoritesClick} />
            });

            return <Term {...newProps} />
        }
    }
}

exports.mapTermsState = (state, map) => {
    return Object.assign(map, {favorites: state.ui.favorites});
}

function passProps (uid, parentProps, props) {
    return Object.assign({}, props, {
        favorites: parentProps.favorites
    });
}

exports.getTermGroupProps = passProps;
exports.getTermProps = passProps;

exports.middleware = store => next => (action) => {
    const { type, config: { favorites } = {} } = action;

    if (type === 'CONFIG_LOAD' || type === 'CONFIG_RELOAD') {
        store.dispatch({
            type: 'FAVORITES_UPDATE',
            favorites
        });
    }

    next(action);
}

exports.reduceUI = (state, {type, favorites}) => {
    if (type === 'FAVORITES_UPDATE') {
        return state.set('favorites', favorites);
    }

    return state;
}
