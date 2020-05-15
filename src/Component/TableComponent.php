<?php

namespace Creonit\AdminBundle\Component;

use Creonit\AdminBundle\Component\Column\SortableColumn;
use Creonit\AdminBundle\Component\Request\ComponentRequest;
use Creonit\AdminBundle\Component\Response\ComponentResponse;
use Creonit\AdminBundle\Component\Scope\TableRowScope;

abstract class TableComponent extends ListComponent
{
    const SORTABLE_COLUMN_NAME_QUERY = '_sortable_column_name';
    const SORTABLE_COLUMN_DIRECTION_QUERY = '_sortable_column_direction';

    protected $scopesType = TableRowScope::class;
    protected $columns = [];

    /**
     * @param string $columns
     * @return TableComponent
     */
    public function setColumns($columns)
    {
        if (preg_match_all('/\s*(?:{(?<sort_name>[\w_]+)(?<sort_default>\!)? *(?:(?<sort_direction_mode>[:$])(?<sort_direction>asc|desc))?})?\s*(?|\'(?<value>[^\']*?)\'|\"(?<value>[^\"]*?)\"|(?<value>.+?))\s*(?:,|$)/usi', $columns, $matches, PREG_SET_ORDER)) {
            $columns = [];

            foreach ($matches as $match) {
                $width = 'auto';
                $value = trim($match['value']);

                if ($value and $value[0] === '.') {
                    $width = '1%';
                    $value = ltrim($value, '.');
                }

                $column = ['value' => $value, 'width' => $width];

                if ($match['sort_name']) {
                    $column += [
                        'sortable_column_name' => $match['sort_name'],
                        'sortable_column_default' => (bool)$match['sort_default'],
                        'sortable_column_direction' => $match['sort_direction'] ? strtolower($match['sort_direction']) : 'asc',
                        'sortable_column_direction_mode' => $match['sort_direction_mode'] ? ($match['sort_direction_mode'] === '$' ? 'strict' : 'default') : 'default',
                    ];
                }

                $columns[] = $column;
            }
            $this->columns = $columns;
        }
        return $this;
    }

    /**
     * @return array
     */
    public function getColumns()
    {
        return $this->columns;
    }

    public function prepareTemplate()
    {
        if (!$this->template) {
            $this->setTemplate($this->container->get('twig')->render('@CreonitAdmin/Components/table.html.twig', ['component' => $this]));
        }
        return parent::prepareTemplate();
    }

    public function applySchemaAnnotation($annotation)
    {
        switch ($annotation['key']) {
            case 'cols':
            case 'columns':
                $this->setColumns($annotation['value']);
                break;
            default:
                parent::applySchemaAnnotation($annotation);
        }
    }

    protected function hasSortableColumns()
    {
        foreach ($this->columns as $column) {
            if (isset($column['sortable_column_name'])) {
                return true;
            }
        }

        return false;
    }

    /**
     * @return SortableColumn|null
     */
    protected function getDefaultSortableColumn()
    {
        foreach ($this->columns as $column) {
            if (isset($column['sortable_column_default']) and $column['sortable_column_default'] === true) {
                return $this->convertSortableColumn($column);
            }
        }

        return null;
    }

    /**
     * @param ComponentRequest $request
     * @return SortableColumn|null
     */
    protected function extractSortableColumn(ComponentRequest $request)
    {
        $sortableColumnName = $request->query->get(static::SORTABLE_COLUMN_NAME_QUERY);
        $sortableColumnDirection = $request->query->get(static::SORTABLE_COLUMN_DIRECTION_QUERY);

        if (!$sortableColumnName or !$sortableColumnDirection) {
            return null;
        }

        foreach ($this->columns as $column) {
            if (isset($column['sortable_column_name']) and $column['sortable_column_name'] === $sortableColumnName) {
                return $this->convertSortableColumn($column)->setDirection($sortableColumnDirection);
            }
        }

        return null;
    }

    /**
     * @param array $column
     * @return SortableColumn
     */
    protected function convertSortableColumn($column)
    {
        $sortableColumn = new SortableColumn();
        $sortableColumn->setName($column['sortable_column_name']);
        $sortableColumn->setDirection($column['sortable_column_direction']);

        return $sortableColumn;
    }

    protected function loadData(ComponentRequest $request, ComponentResponse $response)
    {
        if ($this->hasSortableColumns()) {
            if (!$request->query->has(static::SORTABLE_COLUMN_NAME_QUERY)) {
                if ($defaultSortableColumn = $this->getDefaultSortableColumn()) {
                    $request->query->set(static::SORTABLE_COLUMN_NAME_QUERY, $defaultSortableColumn->getName());
                    $request->query->set(static::SORTABLE_COLUMN_DIRECTION_QUERY, $defaultSortableColumn->getDirection());
                    $response->query->set(static::SORTABLE_COLUMN_NAME_QUERY, $defaultSortableColumn->getName());
                    $response->query->set(static::SORTABLE_COLUMN_DIRECTION_QUERY, $defaultSortableColumn->getDirection());
                }
            }
        }

        parent::loadData($request, $response);
    }

    public function dump()
    {
        return array_replace(parent::dump(), [
            'columns' => $this->columns
        ]);
    }
}