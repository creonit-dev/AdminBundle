<?php

namespace Creonit\AdminBundle\Component\Field;

class SelectField extends Field
{
    const TYPE = 'select';

    public function decorate($data)
    {
        $parameterOptions = $this->parameters->get('options', []);
        $options = [];

        foreach($parameterOptions as $value => $title){
            $options[] = ['value' => $value, 'title' => $title];
        }

        return [
            'value' => $data,
            'title' => isset($parameterOptions[$data]) ? $parameterOptions[$data] : '',
            'options' => $options
        ];
    }


    public function setOptions($options){
        $this->parameters->set('options', $options);
        return $this;
    }


}
