<template>

  <KModal
    :title="$tr('welcomeModalHeader')"
    :submitText="$tr('welcomeButtonDismissText')"
    @submit="emitCloseModal"
    @cancel="emitCloseModal"
  >
    <p class="welcome-modal-description">
      {{ $tr('welcomeModalContentDescription') }}
    </p>

    <p class="welcome-modal-description">
      {{ $tr('welcomeModalPermissionsDescription') }}
    </p>
  </KModal>

</template>


<script>

  import KModal from 'kolibri.coreVue.components.KModal';
  import KButton from 'kolibri.coreVue.components.KButton';

  export default {
    name: 'WelcomeModal',
    $trs: {
      welcomeModalHeader: 'Welcome to Kolibri!',
      welcomeModalContentDescription:
        'The first thing you should do is import some content from the Content tab.',
      welcomeModalPermissionsDescription:
        'The admin account you created during setup has special permissions to do this. Learn more in the Permissions tab later.',
      welcomeButtonDismissText: 'OK',
    },
    components: { KModal, KButton },
    methods: {
      emitCloseModal() {
        this.$emit('closeModal');
      },
    },
    render: createElement => window.setTimeout(createElement, 750),
  };

</script>


<style lang="scss" scoped>

  .welcome-modal {
    &-description {
      margin-top: 16px;
    }
    &-dismiss-button {
      margin-top: 24px;
      margin-bottom: 16px;
    }
  }

</style>
