package com.korea.petclinic.controller;

import java.util.List;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.korea.petclinic.service.ReservationService;
import com.korea.petclinic.vo.ReservationStatusCountVO;
import com.korea.petclinic.vo.ReservationVO;

import lombok.RequiredArgsConstructor;

@CrossOrigin
@RestController
@RequestMapping("/reservations")
@RequiredArgsConstructor
public class ReservationController {

    private final ReservationService reservationService;

    @GetMapping
    public List<ReservationVO> findAll() {
        return reservationService.findAll();
    }
    
    @GetMapping
    public ReservationVO findById(@PathVariable Long id) {
    	return reservationService.findById(id);
    }
    
    @PutMapping("/{id}")
    public int update(
    		@PathVariable Long id,
    		@RequestBody ReservationVO reservation){
    	
    	reservation.setId(id);
    	
    	return reservationService.update(reservation);
    			
    		}
    @PostMapping
    public int insert(@RequestBody ReservationVO reservation) {
    	return reservationService.insert(reservation);
    }
    
    @DeleteMapping("/{id}")
    public int delete(@PathVariable Long id) {
    	return reservationService.delete(id);
    }
    
    @GetMapping("/search-deatil")
    public List<ReservationVO> searchDetail(
    		@RequestParam String searchType,
    		@RequestParam String keyword){
    	
    	return reservationService.searchDetail(searchType, keyword);
    	
    }
    @GetMapping("/sort")
    public List<ReservationVO> sortByprice(
    		@RequestParam String sort) {
    	return reservationService.sortByPrice(sort);
    }
    
    @GetMapping("/status-count")
    public List<ReservationStatusCountVO> countByStatus() 
    {
    	return reservationService.countByStatus();
    }
 
}