import app from 'flarum/forum/app';
import addComposerAutocomplete from './addComposerAutocomplete';

app.initializers.add('marchccc/flarum-ext-mentions-group-users', function () {


  // 在输入 ',' 后，展示一个下拉列表可以选择要@的用户
  addComposerAutocomplete();
  
});