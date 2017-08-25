# hyper-favorites

A Hyper plugin that adds a favorites bar to the bottom of your Hyper terminal. Very rough right now; I would not recommend using this unless you are wanting to help test/contribute or you hate yourself

## Usage

- Open your hyper config
- Add a favorites key
- Add an array of favorites like this: 
    ```
    favorites: [
        {
            name: "Home",
            cmd: "cd ~"
        }
    ]
    ```
- You can also add multiple commands on a single favorite
    ```
    {
        name: "Dev hyper-favorites",
        cmd: ["cd ~/dev/hyper-favorites", "npm run watch"]
    }
    ```

## Upcoming Features

- Load favorites on a per folder basis
- Adjust styles to better match Hyper
- Add user styling ability
- Add some sort of collapsable menu
- Add keybindings for commands
- Add extensibility functionality for others to tap into
    