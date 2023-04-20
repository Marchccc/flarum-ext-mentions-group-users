import app from 'flarum/forum/app';
import { extend } from 'flarum/common/extend';
import TextEditor from 'flarum/common/components/TextEditor';
import TextEditorButton from 'flarum/common/components/TextEditorButton';
import KeyboardNavigatable from 'flarum/common/utils/KeyboardNavigatable';
import AutocompleteDropdown from './fragments/AutocompleteDropdown';
import usernameHelper from 'flarum/common/helpers/username';
import highlight from 'flarum/common/helpers/highlight';
import avatar from 'flarum/common/helpers/avatar';
import getCleanDisplayName from './utils/getCleanDisplayName';

export default function addComposerAutocomplete() {

  const $container = $('<div class="ComposerBody-superMentionsDropdownContainer"></div>');
  const dropdown = new AutocompleteDropdown();

  extend(TextEditor.prototype, 'oncreate', function () {
    const $editor = this.$('.TextEditor-editor').wrap('<div class="ComposerBody-mentionsWrapper"></div>');

    // 绑定键盘动作回调给下拉列表类
    this.navigator = new KeyboardNavigatable();
    this.navigator
      .when(() => dropdown.active)
      .onUp(() => dropdown.navigate(-1))
      .onDown(() => dropdown.navigate(1))
      .onSelect(dropdown.complete.bind(dropdown))
      .onCancel(dropdown.hide.bind(dropdown))
      .bindTo($editor);

    $editor.after($container);
  });

  extend(TextEditor.prototype, 'buildEditorParams', function (params) {
    let relMentionStart;
    let absMentionStart;
    let typed;

    const returnedUsers = Array.from([]);
    const returnedUserIds = new Set(returnedUsers.map((u) => u.id()));

    app.store.find('group_users', {}).then((results) => {
      results.forEach((u) => {
        returnedUserIds.add(u.id());
        returnedUsers.push(u);
      });
    });

    // 选中
    const applySuggestion = (replacement) => {
      this.attrs.composer.editor.replaceBeforeCursor(absMentionStart - 1, replacement + ' ');

      dropdown.hide();
    };

    // 增加输入监听事件
    params.inputListeners.push(() => {
      const selection = this.attrs.composer.editor.getSelectionRange();

      const cursor = selection[0];

      if (selection[1] - cursor > 0) return;

      // 从光标向后搜索 '/', 显示自动完成下拉
      const lastChunk = this.attrs.composer.editor.getLastNChars(15);
      absMentionStart = 0;
      for (let i = lastChunk.length - 1; i >= 0; i--) {
        const character = lastChunk.substr(i, 1);
        // 确保 '/' 前面有空格或换行符
        if (character === '/' && (i == 0 || /\s/.test(lastChunk.substr(i - 1, 1)))) {
          relMentionStart = i + 1;
          absMentionStart = cursor - lastChunk.length + i + 1;
          break;
        }
      }

      dropdown.hide();
      dropdown.active = false;

      if (absMentionStart) {
        // 输入内容
        typed = lastChunk.substring(relMentionStart).toLowerCase();

        // 生成显示列表的单个项
        const makeSuggestion = function (user, replacement, content, className = '') {
          const username = usernameHelper(user);

          if (typed) {
            username.children = [highlight(username.text, typed)];
            delete username.text;
          }

          return (
            <button
              className={'PostPreview ' + className}
              onclick={() => applySuggestion(replacement)}
              onmouseenter={function () {
                dropdown.setIndex($(this).parent().index());
              }}
            >
              <span className="PostPreview-content">
                {avatar(user)}
                {username}
              </span>
            </button>
          );
        };

        // 根据关键字匹配
        const userMatches = function (user) {
          const names = [user.username(), user.displayName()];

          return names.some((name) => name.toLowerCase().includes(typed.toLowerCase()));
        };

        // 生成显示列表
        const buildSuggestions = () => {
          const suggestions = [];

          returnedUsers.forEach((user) => {

            // 如果输入了关键字则过滤显示列表
            if (typed != '') {
              if (!userMatches(user)) return;
            }

            const cleanText = getCleanDisplayName(user, false);

            suggestions.push(makeSuggestion(user, `@${cleanText}`, '', 'MentionsDropdown-user'));
          });


          if (suggestions.length) {
            dropdown.items = suggestions;
            m.render($container[0], dropdown.render());

            dropdown.show();
            const coordinates = this.attrs.composer.editor.getCaretCoordinates(absMentionStart);
            const width = dropdown.$().outerWidth();
            const height = dropdown.$().outerHeight();
            const parent = dropdown.$().offsetParent();
            let left = coordinates.left;
            let top = coordinates.top + 15;

            // 将下拉列表保留在编辑器中
            if (top + height > parent.height()) {
              top = coordinates.top - height - 15;
            }
            if (left + width > parent.width()) {
              left = parent.width() - width;
            }

            // 防止手机上的下拉列表离开屏幕
            top = Math.max(-(parent.offset().top - $(document).scrollTop()), top);
            left = Math.max(-parent.offset().left, left);

            dropdown.show(left, top);
          } else {
            dropdown.active = false;
            dropdown.hide();
          }
        };

        buildSuggestions();

        dropdown.setIndex(0);
        dropdown.$().scrollTop(0);
        dropdown.active = true;
      }
    });
  });

  extend(TextEditor.prototype, 'toolbarItems', function (items) {
    items.add(
      'superAt',
      <TextEditorButton onclick={() => this.attrs.composer.editor.insertAtCursor('/')} icon="fas fa-user-plus">
        {app.translator.trans('marchccc-mentions-group-users.forum.composer.mention_tooltip')}
      </TextEditorButton>
    );
  });
}
