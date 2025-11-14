package com.ERP.Vinar.controllers;

import com.ERP.Vinar.dto.PurchaseOrderDTO;
import com.ERP.Vinar.dto.PurchaseOrderElementDTO;
import com.ERP.Vinar.entities.PurchaseOrdersEntity;
import com.ERP.Vinar.entities.PurchaseOrderElements;
import com.ERP.Vinar.repositories.PurchaseOrderRepository;
import com.ERP.Vinar.repositories.PurchaseOrderElementsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/po")
@CrossOrigin(origins = "http://localhost:4200")
public class PurchaseOrderController {

    @Autowired
    private PurchaseOrderRepository poRepo;

    @Autowired
    private PurchaseOrderElementsRepository elementsRepo;

    // ✅ Get all Purchase Orders
    @GetMapping
    public List<PurchaseOrderDTO> getAllPOs() {
        return poRepo.findAll().stream()
                .map(PurchaseOrderDTO::fromEntity)
                .collect(Collectors.toList());
    }

    // ✅ Get single PO by ID
    @GetMapping("/{id}")
    public PurchaseOrderDTO getPO(@PathVariable Long id) {
        PurchaseOrdersEntity po = poRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Purchase Order not found"));
        return PurchaseOrderDTO.fromEntity(po);
    }

    // ✅ Create new PO
    @PostMapping
    public PurchaseOrderDTO createPO(@RequestBody PurchaseOrdersEntity po) {
        if (po.getElements() != null)
            po.getElements().forEach(e -> e.setPurchaseOrder(po));

        po.setStatus("Pending");
        if (po.getLocation() == null || po.getLocation().isEmpty()) {
            po.setLocation("Unknown"); // default safety fallback
        }

        PurchaseOrdersEntity savedPO = poRepo.save(po);
        return PurchaseOrderDTO.fromEntity(savedPO);
    }

    // ✅ Add a new element to an existing PO
    @PostMapping("/{poId}/elements")
    public PurchaseOrderElementDTO addElement(@PathVariable Long poId,
                                              @RequestBody PurchaseOrderElements element) {
        PurchaseOrdersEntity po = poRepo.findById(poId)
                .orElseThrow(() -> new RuntimeException("Purchase Order not found"));
        element.setPurchaseOrder(po);
        return PurchaseOrderElementDTO.fromEntity(elementsRepo.save(element));
    }

    // ✅ Update PO status
    @PutMapping("/{poId}/status")
    public PurchaseOrderDTO updateStatus(@PathVariable Long poId,
                                         @RequestParam String status) {
        PurchaseOrdersEntity po = poRepo.findById(poId)
                .orElseThrow(() -> new RuntimeException("Purchase Order not found"));
        po.setStatus(status);
        return PurchaseOrderDTO.fromEntity(poRepo.save(po));
    }
}
