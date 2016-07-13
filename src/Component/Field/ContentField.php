<?php

namespace Creonit\AdminBundle\Component\Field;

use Creonit\AdminBundle\Component\Request\ComponentRequest;
use Creonit\ContentBundle\Model\Content;
use Creonit\ContentBundle\Model\ContentQuery;
use Symfony\Component\Validator\ConstraintViolation;
use Symfony\Component\Validator\ConstraintViolationList;

class ContentField extends Field
{
    protected $type = 'content';

    public function load($entity)
    {
        if($data = parent::load($entity)){
            return $data;
        }else{
            $content = new Content();
            $content->save();
            return $this->decorate($content->getId());
        }
    }

    public function decorate($data)
    {
        if($data){
            dump($data);
            $content = ContentQuery::create()->findPk($data);

            return [
                'id' => $content->getId(),
                'text' => $content->getText(),
            ];

        }else{
            return $data;
        }
    }

    public function extract(ComponentRequest $request)
    {
        return [
            'id' => $id = parent::extract($request),
            'text' => $request->data->get($this->name . '__text'),
            'content' => $id ? ContentQuery::create()->findPk($id) : null
        ];
    }

    public function save($entity, $data, $processed = false)
    {
        if($processed === false){
            $data = $this->process($data);
        }

        if($data['text']){
            $data['content']->setText($data['text']);
        }

        $data['content']->setCompleted(true)->save();

        parent::save($entity, $data['id'], true);

    }

    public function validate($data)
    {
        if(null === $data['content']){
            return new ConstraintViolationList([new ConstraintViolation($message = 'Ошибка загрузки контента', $message, [], null, null, null)]);
        }
        return parent::validate($data);
    }


}