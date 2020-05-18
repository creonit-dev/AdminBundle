<?php

namespace Creonit\AdminBundle\Controller;

use Creonit\AdminBundle\Manager;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;

class LayoutController extends AbstractController
{
    public function sidebarAction(Manager $admin)
    {
        return $this->render('@CreonitAdmin/Layout/sidebar.html.twig', ['admin' => $admin]);
    }

    public function headerAction(Manager $admin)
    {
        $module = $admin->getActiveModule();
        return $this->render('@CreonitAdmin/Layout/header.html.twig', ['module' => $module, 'admin' => $admin]);
    }
}
