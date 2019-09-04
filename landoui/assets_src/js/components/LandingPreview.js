'use strict';

$.fn.landingPreview = function() {
  return this.each(function() {
    let $landingPreview = $(this);
    let $close = $landingPreview.find('.StackPage-landingPreview-close');
    let $warnings = $landingPreview.find('.StackPage-landingPreview-warnings input[type=checkbox]');
    let $blocker = $landingPreview.find('.StackPage-landingPreview-blocker');
    let $landButton = $landingPreview.find('.StackPage-landingPreview-land');
    let $revisions = $landingPreview.find('.StackPage-landingPreview-revision');
    let $expandAllButton = $landingPreview.find('.StackPage-landingPreview-expandAll');
    let $collapseAllButton = $landingPreview.find('.StackPage-landingPreview-collapseAll');

    // Reach outside my component, because I'm a pragmatist.
    let $previewButton = $('.StackPage-preview-button');

    let calculateLandButtonState = () => {
      if($blocker.length > 0) {
        $landButton.attr({'disabled': true});
        $landButton.text('Landing is blocked');
        return;
      }

      let checked = $warnings.filter(function() {
        return this.checked;
      });
      if(checked.length !== $warnings.length) {
        $landButton.attr({'disabled': true});
        $landButton.text('Acknowledge warnings to land');
      } else {
        $landButton.attr({'disabled': false});
        $landButton.text('Land to ' + $landButton.data('target-repo'));
      }
    };


    $landButton.on('click', () => {
      $landButton.attr({'disabled': true});
      $landButton.text('Landing in progress...');
    });

    let expandCommitMessage = ($commitMessage, $seeMore, $toggleButton, lines) => {
      $commitMessage.css('max-height', 'none');
      $commitMessage.data('expanded', true);
      $toggleButton.text('Hide lines');
      $seeMore.css('display', 'none');
    };

    let collapseCommitMessage = ($commitMessage, $seeMore, $toggleButton, lines) => {
      $commitMessage.css('max-height', '');
      $commitMessage.data('expanded', false);
      $toggleButton.text('Show all ' + lines + ' lines');
      $seeMore.css('display', 'block');
    };

    let toggleCommitMessage = ($commitMessage, $seeMore, $toggleButton, lines) => {
      if($commitMessage.data('expanded')) {
        collapseCommitMessage($commitMessage, $seeMore, $toggleButton, lines);
      } else {
        expandCommitMessage($commitMessage, $seeMore, $toggleButton, lines);
      }
    };

    let swapDisplayEditPanels = ($displayMessagePanel, $editMessagePanel) => {
      if($editMessagePanel.data('expanded')) {
        $displayMessagePanel.show();
        $editMessagePanel.hide();
        $editMessagePanel.data('expanded', false);
      } else {
        $displayMessagePanel.hide();
        $editMessagePanel.show();
        $editMessagePanel.data('expanded', true);
      }
    };

    let longMessages = 0;

    $revisions.each(function () {
      let $revision = $(this);

      // Message display
      let $displayMsgPanel = $revision.find('.StackPage-landingPreview-displayMessagePanel');
      let $toggleButton = $revision.find('.StackPage-landingPreview-expand');
      let $commitMessage = $revision.find('.StackPage-landingPreview-commitMessage');
      let $seeMore = $revision.find('.StackPage-landingPreview-seeMore');
      let lines = $commitMessage.text().split(/\r\n|\r|\n/).length;

      // Message editing
      let $editMessageBtn = $revision.find('.StackPage-landingPreview-editMessage');
      let $editMsgPanel = $revision.find('.StackPage-landingPreview-editMessagePanel');
      let $submitMsgBtn = $editMsgPanel.find("button[type=submit]");
      let $cancelMsgBtn = $editMsgPanel.find("button.StackPage-landingPreview-cancelMsgEditBtn");

      ///////////////////////////
      //
      // Message display routines
      //
      ///////////////////////////

      if (lines <= 5){
        $toggleButton.hide();
      } else {
        // Handle long commit messages.

        longMessages++;

        // Sets up the display of how many lines are hidden:
        // expandCommitMessage and collapseCommitMessage merely toggle this when clicked.
        $toggleButton.text('Show all ' + lines + ' lines');
        $seeMore.text('... (' + (lines - 5) + ' more lines)');

        $toggleButton.on('click', (e) => {
          e.preventDefault();
          toggleCommitMessage($commitMessage, $seeMore, $toggleButton, lines);
        });

        $expandAllButton.on('click', (e) => {
          e.preventDefault();
          expandCommitMessage($commitMessage, $seeMore, $toggleButton, lines);
        });

        $collapseAllButton.on('click', (e) => {
          e.preventDefault();
          collapseCommitMessage($commitMessage, $seeMore, $toggleButton, lines)
        });
      }

      ///////////////////////////
      //
      // Message editing routines
      //
      ///////////////////////////

      $editMessageBtn.on('click', (e) => {
        e.preventDefault();
        $editMessageBtn.attr({'disabled': true});
        swapDisplayEditPanels($displayMsgPanel, $editMsgPanel);
      });

      $submitMsgBtn.on('click', (e) => {
        //
        // e.preventDefault();
        // TODO redirect to a page that shows a message informing the user about what happened, what
        //   they should do next.
        // $editMessageBtn.attr({'disabled': false});
      });

      $cancelMsgBtn.on('click', (e) => {
        e.preventDefault();
        $editMessageBtn.attr({'disabled': false});
        swapDisplayEditPanels($displayMsgPanel, $editMsgPanel);
      });
    });

    if ($revisions.length === 1 || longMessages === 0) {
      $expandAllButton.css('display', 'none');
      $collapseAllButton.css('display', 'none');
    }


    $previewButton.on('click', (e) => {
      e.preventDefault();
      calculateLandButtonState();
      $landingPreview.show();
    });
    $close.on('click', (e) => {
      e.preventDefault();
      $landingPreview.hide();
    });
    $warnings.on('change', () => {
      calculateLandButtonState();
    });
  });
};
