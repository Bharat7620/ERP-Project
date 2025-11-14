package com.ERP.Vinar.dto;

import com.ERP.Vinar.entities.PurchaseOrdersEntity;
import java.util.List;
import java.util.stream.Collectors;

public class PurchaseOrderDTO {

    private Long id;
    private String orderNo;
    private String party;
    private String date;
    private String status;
    private String location; // ✅ Added field
    private List<PurchaseOrderElementDTO> elements;
    private List<GRNDTO> grns;

    public static PurchaseOrderDTO fromEntity(PurchaseOrdersEntity po) {
        PurchaseOrderDTO dto = new PurchaseOrderDTO();
        dto.setId(po.getId());
        dto.setOrderNo(po.getOrderNo());
        if (po.getVendor() != null) {
            dto.setParty(po.getVendor().getName());
        }
        dto.setDate(po.getDate());
        dto.setStatus(po.getStatus());
        dto.setLocation(po.getLocation()); // ✅ Map location from entity

        if (po.getElements() != null) {
            dto.setElements(po.getElements().stream()
                    .map(PurchaseOrderElementDTO::fromEntity)
                    .collect(Collectors.toList()));
        }

        if (po.getGrns() != null) {
            dto.setGrns(po.getGrns().stream()
                    .map(GRNDTO::fromEntity)
                    .collect(Collectors.toList()));
        }

        return dto;
    }

    // --- Getters and Setters ---
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getOrderNo() { return orderNo; }
    public void setOrderNo(String orderNo) { this.orderNo = orderNo; }

    public String getParty() { return party; }
    public void setParty(String party) { this.party = party; }

    public String getDate() { return date; }
    public void setDate(String date) { this.date = date; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public List<PurchaseOrderElementDTO> getElements() { return elements; }
    public void setElements(List<PurchaseOrderElementDTO> elements) { this.elements = elements; }

    public List<GRNDTO> getGrns() { return grns; }
    public void setGrns(List<GRNDTO> grns) { this.grns = grns; }
}
