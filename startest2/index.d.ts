/* tslint:disable */
/* eslint-disable */
export default class StarTestApp {
  /**
   * @param {boolean} useFPSCounter 
   * @param {boolean} useCompass 
   * @param {boolean} viewDistance
   * @returns {StarTestApp}
   */
  static new(useFPSCounter: boolean, useCompass: boolean, viewDistance: boolean): StarTestApp;
  /**
   * @param {HTMLElement} element 
   */
  bindContainer(element: HTMLElement): void;
  initControls(): void;
  runSimulation(): void;
  stopSimulation(): void;
}