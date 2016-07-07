<?php

namespace Creonit\AdminBundle\Component\Field;

use Symfony\Component\ExpressionLanguage\ExpressionLanguage;

class ExternalField extends Field
{
    
    public function load($entity)
    {
        if($data = parent::load($entity)){
            if($this->parameters->has('title')){
                $language = new ExpressionLanguage();
                $title = $this->decorate($language->evaluate($this->parameters->get('title'), ['entity' => $entity]));
            }else{
                $title = $data;
            }

            return $this->decorate([
                'title' => $title,
                'value' => $data,
            ]);

        }
        return $data;
    }

    public function process($data)
    {
        return $data ?: null;
    }


}