<?php

namespace Creonit\AdminBundle\Component\Field;

use Creonit\AdminBundle\Component\Request\ComponentRequest;
use Propel\Runtime\Map\TableMap;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Symfony\Component\ExpressionLanguage\ExpressionLanguage;
use Symfony\Component\HttpFoundation\ParameterBag;
use Symfony\Component\Validator\Constraints\NotBlank;

class Field
{
    const TYPE = 'default';
    const HELPERS = '';

    protected $name;
    protected $default;

    public $parameters;
    /** @var ContainerInterface */
    protected $container;

    public function __construct()
    {
        $this->parameters = new ParameterBag;
    }

    /**
     * @param ContainerInterface $container
     */
    public function setContainer($container)
    {
        $this->container = $container;
    }

    /**
     * @param mixed $name
     * @return Field
     */
    public function setName($name)
    {
        $this->name = $name;
        return $this;
    }

    /**
     * @return mixed
     */
    public function getName()
    {
        return $this->name;
    }

    public function validate($data)
    {
        return ($required = $this->parameters->get('required')) || $this->parameters->has('constraints')
            ? $this->container->get('validator')->validate(
                $data,
                $required
                    ? array_merge($this->parameters->get('constraints', []), [new NotBlank(true === $required ? [] : ['message' => $required])])
                    : $this->parameters->get('constraints'))
            : [];

    }

    public function process($data)
    {
        return $data;
    }

    final public function saveValue($entity, $data)
    {
        if (!$data instanceof NoData) {
            if ($this->parameters->has('save')) {
                $language = new ExpressionLanguage();
                return $language->evaluate($this->parameters->get('load'), ['entity' => $entity, 'data' => $data]);

            } else if (property_exists($entity, $this->name)) {
                $entity->setByName($this->name, $data, TableMap::TYPE_FIELDNAME);

            } else if (class_exists($i18n = get_class($entity) . 'I18n') and preg_match('/([\s\S]+)_(\w+)$/', $this->getName(), $match)) {
                $tableMap = constant($i18n . '::TABLE_MAP');
                $tableMap = $tableMap::getTableMap();
                list(, $fieldName, $locale) = $match;

                if ($tableMap->hasColumn($fieldName)) {
                    $methodName = 'set' . $tableMap::translateFieldName($fieldName, TableMap::TYPE_FIELDNAME, TableMap::TYPE_PHPNAME);
                    if (method_exists($entity, $methodName)) {
                        $entity->$methodName($data, $locale);
                    } else {
                        $translation = $entity->getTranslation($locale);
                        $translation->setByName($fieldName, $data, TableMap::TYPE_FIELDNAME);
                    }
                }
            }
        }
    }

    public function save($entity, $data, $processed = false)
    {
        if ($processed === false) {
            $data = $this->process($data);
        }

        $this->saveValue($entity, $data);
    }

    public function extract(ComponentRequest $request)
    {
        if ($request->data->has($this->name)) {
            return $request->data->get($this->name);
        }
        return new NoData();
    }

    final public function loadValue($entity)
    {
        if ($this->parameters->has('load')) {
            $language = new ExpressionLanguage();
            return $language->evaluate($this->parameters->get('load'), ['entity' => $entity]);

        } else if ($this->hasProperty($entity)) {
            return $entity->getByName($this->name, TableMap::TYPE_FIELDNAME);

        } else if (class_exists($i18n = get_class($entity) . 'I18n') and preg_match('/^([\s\S]+)_(\w+)$/', $this->getName(), $match)) {
            $tableMap = constant($i18n . '::TABLE_MAP');
            $tableMap = $tableMap::getTableMap();
            list(, $fieldName, $locale) = $match;

            if ($tableMap->hasColumn($fieldName)) {
                $methodName = 'get' . $tableMap::translateFieldName($fieldName, TableMap::TYPE_FIELDNAME, TableMap::TYPE_PHPNAME);
                if (method_exists($entity, $methodName)) {
                    $data = $entity->$methodName($locale);
                } else {
                    $translation = $entity->getTranslation($locale);
                    $data = $translation->getByName($fieldName, TableMap::TYPE_FIELDNAME);
                }

            } else {
                $data = null;
            }

            return $data;

        } else {
            return null;
        }
    }

    public function load($entity)
    {
        return $this->decorate($this->loadValue($entity));
    }

    public function hasProperty($entity)
    {
        return property_exists($entity, $this->name);
    }

    public function supportEntity($entity)
    {
        return $this->parameters->has('load') or $this->parameters->has('save') or $this->hasProperty($entity);
    }

    public function decorate($data)
    {
        return $data;
    }

    public function dump()
    {
        return [
            'type' => $this->type,
            'name' => $this->name,
        ];
    }

    public function getType()
    {
        return $this->type;
    }
}