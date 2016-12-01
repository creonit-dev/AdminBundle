<?php

namespace Creonit\AdminBundle\Component\Field;

use Creonit\AdminBundle\Component\Request\ComponentRequest;
use Symfony\Component\Validator\Constraints\NotBlank;

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

    public function extract(ComponentRequest $request)
    {
        $value = parent::extract($request);
        return (is_string($value) && $value == '') ? null : $value;
    }


    public function setOptions($options){
        $this->parameters->set('options', $options);
        return $this;
    }


}
