package com.ERP.Vinar.repositories;

import com.ERP.Vinar.entities.RollingPlanEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RollingPlanRepository extends JpaRepository<RollingPlanEntity, Long> {
}
