{
  inputs = {
    # Need bun 1.3.10
    nixpkgs.url = "github:NixOS/nixpkgs/87d29062c68a585059dd84628c027e943c10a284";
    flake-utils.url = "github:numtide/flake-utils";
  };
  outputs = {
    self,
    nixpkgs,
    flake-utils,
  }:
    flake-utils.lib.eachDefaultSystem
    (
      system: let
        pkgs = import nixpkgs {
          inherit system;
        };
      in
        with pkgs; {
          devShells.default = mkShell {
            buildInputs = with pkgs; [
              nodejs_22
              bun
            ];
          };
        }
    );
}
