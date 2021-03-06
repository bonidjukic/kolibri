<template>

  <KModal
    :title="$tr('header')"
    :submitText="$tr('submitButtonLabel')"
    :cancelText="$tr('cancelButtonLabel')"
    size="medium"
    @submit="handleSubmit"
    :submitDisabled="attemptingToConnect"
    @cancel="$emit('cancel')"
  >
    <KTextbox
      v-model="address"
      :label="$tr('addressLabel')"
      :placeholder="$tr('addressPlaceholder')"
      :autofocus="true"
      :invalid="addressIsInvalid"
      :invalidText="addressInvalidText"
      :disabled="attemptingToConnect"
      @blur="addressBlurred = true"
    />
    <KTextbox
      v-model="name"
      :label="$tr('nameLabel')"
      :placeholder="$tr('namePlaceholder')"
      :invalid="nameIsInvalid"
      :invalidText="$tr('fieldIsRequired')"
      :maxlength="40"
      :disabled="attemptingToConnect"
      @blur="nameBlurred = true"
    />

    <UiAlert
      v-if="attemptingToConnect"
      :dismissible="false"
    >
      {{ $tr('tryingToConnect') }}
    </UiAlert>
  </KModal>

</template>


<script>

  import KModal from 'kolibri.coreVue.components.KModal';
  import KTextbox from 'kolibri.coreVue.components.KTextbox';
  import UiAlert from 'keen-ui/src/UiAlert';
  import { createAddress } from './api';

  const Statuses = {
    COULD_NOT_CONNECT: 'COULD_NOT_CONNECT',
    INVALID_ADDRESS: 'INVALID_ADDRESS',
  };

  export default {
    name: 'AddAddressForm',
    components: {
      KModal,
      KTextbox,
      UiAlert,
    },
    props: {},
    data() {
      return {
        address: '',
        addressBlurred: false,
        attemptingToConnect: false,
        name: '',
        nameBlurred: false,
        status: '',
      };
    },
    computed: {
      addressInvalidText() {
        if (this.status === Statuses.INVALID_ADDRESS) {
          return this.$tr('errorInvalidAddress');
        }
        if (this.status === Statuses.COULD_NOT_CONNECT) {
          return this.$tr('errorCouldNotConnect');
        }
        if (this.address === '') {
          return this.$tr('fieldIsRequired');
        }
        return '';
      },
      addressIsInvalid() {
        return this.addressBlurred && this.addressInvalidText !== '';
      },
      nameIsInvalid() {
        return this.nameBlurred && this.name === '';
      },
      formIsInvalid() {
        return this.addressIsInvalid || this.nameIsInvalid;
      },
    },
    methods: {
      handleSubmit() {
        this.addressBlurred = true;
        this.nameBlurred = true;
        this.status = '';
        if (this.formIsInvalid) {
          return Promise.resolve();
        }
        this.attemptingToConnect = true;
        return createAddress({
          base_url: this.address,
          device_name: this.name,
        })
          .then(() => {
            this.$emit('added_address');
          })
          .catch(err => {
            const { id } = err.entity[0];
            if (id === 'NETWORK_LOCATION_NOT_FOUND') {
              this.status = Statuses.COULD_NOT_CONNECT;
            } else {
              this.status = Statuses.INVALID_ADDRESS;
            }
          })
          .then(() => {
            this.attemptingToConnect = false;
          });
      },
    },
    $trs: {
      addressLabel: 'Full network address',
      addressPlaceholder: 'e.g. http://123.456.7.89:8080',
      cancelButtonLabel: 'Cancel',
      errorCouldNotConnect: 'Could not connect to this network address',
      errorInvalidAddress: 'Please enter a valid IP address, URL, or hostname',
      header: 'New address',
      fieldIsRequired: 'This field is required',
      nameLabel: 'Network name',
      namePlaceholder: 'e.g. House network',
      submitButtonLabel: 'Add',
      tryingToConnect: 'Trying to connect to server…',
    },
  };

</script>


<style lang="scss" scoped></style>
