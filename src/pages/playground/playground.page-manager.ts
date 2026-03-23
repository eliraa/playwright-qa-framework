import type { Page } from '@playwright/test';
import { AjaxPage, AnimationPage, AutoWaitPage, ClientDelayPage, LoadDelayPage, ProgressBarPage } from './async.page';
import { ClickPage, DynamicIdPage, GeolocationPage, TextInputPage } from './element-interaction.page';
import { HiddenLayersPage, OverlappedPage, VisibilityPage } from './visibility.page';

export class PlaygroundPageManager {
  readonly ajax: AjaxPage;
  readonly animation: AnimationPage;
  readonly autoWait: AutoWaitPage;
  readonly clientDelay: ClientDelayPage;
  readonly click: ClickPage;
  readonly dynamicId: DynamicIdPage;
  readonly geolocation: GeolocationPage;
  readonly hiddenLayers: HiddenLayersPage;
  readonly loadDelay: LoadDelayPage;
  readonly overlapped: OverlappedPage;
  readonly progressBar: ProgressBarPage;
  readonly textInput: TextInputPage;
  readonly visibility: VisibilityPage;

  constructor(page: Page) {
    this.ajax = new AjaxPage(page);
    this.animation = new AnimationPage(page);
    this.autoWait = new AutoWaitPage(page);
    this.clientDelay = new ClientDelayPage(page);
    this.click = new ClickPage(page);
    this.dynamicId = new DynamicIdPage(page);
    this.geolocation = new GeolocationPage(page);
    this.hiddenLayers = new HiddenLayersPage(page);
    this.loadDelay = new LoadDelayPage(page);
    this.overlapped = new OverlappedPage(page);
    this.progressBar = new ProgressBarPage(page);
    this.textInput = new TextInputPage(page);
    this.visibility = new VisibilityPage(page);
  }
}
