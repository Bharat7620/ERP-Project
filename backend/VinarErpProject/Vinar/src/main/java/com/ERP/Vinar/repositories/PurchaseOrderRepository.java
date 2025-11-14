package com.ERP.Vinar.repositories;

import com.ERP.Vinar.entities.PurchaseOrdersEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PurchaseOrderRepository extends JpaRepository<PurchaseOrdersEntity, Long> {
    // Additional custom queries if needed
}
