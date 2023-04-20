<?php

namespace Marchccc\Mention\Api\Controller;

use Flarum\Api\Controller\AbstractListController;
use Flarum\Api\Serializer\UserSerializer;
use Psr\Http\Message\ServerRequestInterface;
use Tobscure\JsonApi\Document;

class GroupUsersController extends AbstractListController
{
    public $serializer = UserSerializer::class;

    /**
     * {@inheritdoc}
     */
    public function data(ServerRequestInterface $request, Document $document)
    {
        $actor = $request->getAttribute('actor');

        $groups = $actor->groups()->get();
        $members = [];
        foreach ($groups as $group) {
            $members = array_merge($members, $group->users()->get()->where('id', '!=', $actor->id)->all());
        }
        return $members;
    }
}
