import "styled-components";
import { THEME } from "constants/styles";

type AVTheme = typeof THEME.landing;

declare module "styled-components" {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  export interface DefaultTheme extends AVTheme {}
}
