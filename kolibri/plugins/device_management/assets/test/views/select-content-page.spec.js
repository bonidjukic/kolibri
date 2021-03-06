import VueRouter from 'vue-router';
import { mount } from '@vue/test-utils';
import SelectContentPage from '../../src/views/SelectContentPage';
import SelectedResourcesSize from '../../src/views/SelectContentPage/SelectedResourcesSize';
import { makeSelectContentPageStore } from '../utils/makeStore';

SelectContentPage.methods.getAvailableSpaceOnDrive = () => {};

const router = new VueRouter({
  routes: [],
});

function makeWrapper(options) {
  const { store, props = {} } = options;
  const wrapper = mount(SelectContentPage, {
    propsData: props,
    store: store || makeSelectContentPageStore(),
    stubs: ['content-tree-viewer'],
    router,
  });
  // To avoid test failures
  wrapper.vm.refreshPage = () => {};
  return wrapper;
}

// prettier-ignore
function getElements(wrapper) {
  return {
    description: () => wrapper.find('.description').text().trim(),
    notificationsSection: () => wrapper.find('section.notifications'),
    onDeviceRows: () => wrapper.findAll('tr.on-device td'),
    resourcesSize: () => wrapper.find(SelectedResourcesSize),
    thumbnail: () => wrapper.find('.thumbnail'),
    title: () => wrapper.find('.title').text().trim(),
    totalSizeRows: () => wrapper.findAll('tr.total-size td'),
    treeView: () => wrapper.find('section.resources-tree-view'),
    updateSection: () => wrapper.find('.updates-available'),
    updateButton: () => wrapper.find('button[name="update"]'),
    version: () => wrapper.find('.version').text().trim(),
    versionAvailable: () => wrapper.find('.updates-available span').text().trim(),
  };
}

function updateMetaChannel(store, updates) {
  const { transferredChannel } = store.state.manageContent.wizard;
  store.commit('manageContent/wizard/SET_TRANSFERRED_CHANNEL', {
    ...transferredChannel,
    ...updates,
  });
}

describe('selectContentPage', () => {
  let store;

  beforeEach(() => {
    store = makeSelectContentPageStore();
  });

  it('shows the thumbnail, title, descripton, and version of the channel', () => {
    const fakeImage = 'data:image/png;base64,abcd1234';
    updateMetaChannel(store, { thumbnail: fakeImage });
    const wrapper = makeWrapper({ store });
    const { thumbnail, version, title, description } = getElements(wrapper);
    // prettier-ignore
    expect(thumbnail().find('img').attributes().src).toEqual(fakeImage);
    expect(title()).toEqual('Awesome Channel');
    expect(version()).toEqual('Version 10');
    expect(description()).toEqual('An awesome channel');
  });

  it('shows the total size of the channel', () => {
    const wrapper = makeWrapper({ store });
    const { totalSizeRows } = getElements(wrapper);
    const rows = totalSizeRows();
    expect(rows.at(1).text()).toEqual('1,000');
    expect(rows.at(2).text()).toEqual('4 GB');
  });

  it('if resources are on the device, it shows the total size of those', () => {
    const wrapper = makeWrapper({ store });
    const { onDeviceRows } = getElements(wrapper);
    const rows = onDeviceRows();
    expect(rows.at(1).text()).toEqual('2,000');
    expect(rows.at(2).text()).toEqual('90 MB');
  });

  it('if channel is not on device, it shows size and resources as 0', () => {
    updateMetaChannel(store, { id: 'not_awesome_channel' });
    const wrapper = makeWrapper({ store });
    const { onDeviceRows } = getElements(wrapper);
    const rows = onDeviceRows();
    expect(rows.at(1).text()).toEqual('0');
    expect(rows.at(2).text()).toEqual('0 B');
  });

  it('if a new version is available, a update notification and button appear', () => {
    updateMetaChannel(store, { version: 1000 });
    const wrapper = makeWrapper({ store });
    const { updateSection, notificationsSection, versionAvailable } = getElements(wrapper);
    expect(updateSection().exists()).toEqual(true);
    expect(notificationsSection().is('section')).toEqual(true);
    // { useGrouping: false } intl option not working, but probably won't see such a large number
    expect(versionAvailable()).toEqual('Version 1,000 available');
  });

  it('in LOCALIMPORT, clicking the "update" button triggers a downloadChannelMetadata action', () => {
    updateMetaChannel(store, { version: 1000 });
    store.state.manageContent.wizard.transferType = 'localimport';
    store.state.manageContent.wizard.selectedDrive = {
      driveId: 'drive_1',
    };
    const wrapper = makeWrapper({ store });
    const { updateButton } = getElements(wrapper);
    const stub = jest.spyOn(wrapper.vm, 'downloadChannelMetadata').mockResolvedValue();
    updateButton().trigger('click');
    expect(stub).toHaveBeenCalled();
  });

  it('in REMOTEIMPORT, clicking the "update" button triggers a downloadChannelMetadata action', () => {
    updateMetaChannel(store, { version: 1000 });
    store.state.manageContent.wizard.transferType = 'remoteimport';
    const wrapper = makeWrapper({ store });
    const { updateButton } = getElements(wrapper);
    const stub = jest.spyOn(wrapper.vm, 'downloadChannelMetadata').mockResolvedValue();
    updateButton().trigger('click');
    expect(stub).toHaveBeenCalled();
  });

  it('if a new version is not available, then no notification/button appear', () => {
    updateMetaChannel(store, { version: 10 }); // same version
    const wrapper = makeWrapper({ store });
    const { updateSection, notificationsSection } = getElements(wrapper);
    expect(notificationsSection().isEmpty()).toEqual(true);
    expect(updateSection().exists()).toEqual(false);
  });
});
