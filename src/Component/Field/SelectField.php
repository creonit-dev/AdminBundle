<?php

namespace Creonit\AdminBundle\Component\Field;

class SelectField extends Field
{

    public function decorate($data)
    {
        $options = [];

        foreach($this->parameters->get('options', []) as $value => $title){
            $options[] = ['value' => $value, 'title' => $title];
        }

        return [
            'value' => $data,
            'options' => $options
        ];
    }


}
