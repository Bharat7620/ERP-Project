package com.ERP.Vinar.repositories;

import com.ERP.Vinar.entities.RMStockEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

public interface RMStockRepository extends JpaRepository<RMStockEntity, Long> {

    Optional<RMStockEntity> findByLocationAndMaterialAndGradeAndSectionAndSteelWidthAndLengthAndType(
            String location, String material, String grade, String section,
            BigDecimal steelWidth, BigDecimal length, String type
    );

    List<RMStockEntity> findByLocation(String location);

    List<RMStockEntity> findByMaterial(String material);

    List<RMStockEntity> findByLocationAndMaterial(String location, String material);
}
