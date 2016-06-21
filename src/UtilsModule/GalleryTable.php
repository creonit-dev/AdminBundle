<?php

namespace Creonit\AdminBundle\UtilsModule;

use AppBundle\Model\Base\GalleryItemQuery;
use Creonit\AdminBundle\Component\Request\ComponentRequest;
use Creonit\AdminBundle\Component\Response\ComponentResponse;
use Creonit\AdminBundle\Component\Scope\Scope;
use Creonit\AdminBundle\Component\TableComponent;
use Propel\Runtime\ActiveQuery\ModelCriteria;

class GalleryTable extends TableComponent
{


    /**
     *
     * @header
     * {{ button('Добавить изображение', {icon: 'image', size: 'sm', type: 'success'}) | open('CreonitUtils.GalleryImageEditor', _query) }}
     * {{ button('Добавить видео', {icon: 'youtube-play', size: 'sm', type: 'success'}) | open('CreonitUtils.GalleryVideoEditor', _query) }}
     *
     * @cols Изображение / Видео, .
     *
     * \GalleryItem
     *
     * @field image_id:image
     * @field video_id:video
     * @field url:image
     *
     * @col
     * {% if image_id %}
     *      {{ image_id.preview | raw | open('CreonitUtils.GalleryImageEditor', {key: _key}) }}
     * {% else %}
     *      {{ video_id.preview | raw | open('CreonitUtils.GalleryVideoEditor', {key: _key}) }}
     * {% endif %}
     *
     * @col {{ _delete() }}
     *
     */
    public function schema()
    {
    }

    /**
     * @param ComponentRequest $request
     * @param ComponentResponse $response
     * @param GalleryItemQuery $query
     * @param Scope $scope
     * @param $relation
     * @param $relationValue
     * @param $level
     */
    protected function filter(ComponentRequest $request, ComponentResponse $response, $query, Scope $scope, $relation, $relationValue, $level)
    {
        $query->filterByGalleryId($request->query->get('gallery_id'));
        
    }


}