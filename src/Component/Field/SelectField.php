<?php

namespace Creonit\AdminBundle\Component\Field;

class SelectField extends Field
{
    protected $type = 'select';


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


}
