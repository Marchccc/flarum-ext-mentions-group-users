<?php

/*
 * This file is part of marchccc/flarum-ext-mentions-group-users.
 *
 * Copyright (c) 2023 Marchccc.
 *
 * For the full copyright and license information, please view the LICENSE.md
 * file that was distributed with this source code.
 */

namespace Marchccc\Mention;

use Flarum\Extend;
use Marchccc\Mention\Api\Controller\GroupUsersController;

return [
    (new Extend\Frontend('forum'))
        ->js(__DIR__ . '/js/dist/forum.js')
        ->css(__DIR__ . '/less/forum.less'),
    (new Extend\Frontend('admin'))
        ->js(__DIR__ . '/js/dist/admin.js')
        ->css(__DIR__ . '/less/admin.less'),
    new Extend\Locales(__DIR__ . '/locale'),
    (new Extend\Routes('api'))
        ->get('/group_users',  '', GroupUsersController::class),

];
