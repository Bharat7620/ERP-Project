package com.ERP.Vinar.repositories;

import com.ERP.Vinar.entities.LoiEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LoiRepository extends JpaRepository<LoiEntity, Long> {
    boolean existsByLoiNumber(String loiNumber);
}
