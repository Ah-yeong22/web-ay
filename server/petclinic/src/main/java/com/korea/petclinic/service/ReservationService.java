package com.korea.petclinic.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.korea.petclinic.dao.ReservationDAO;
import com.korea.petclinic.vo.ReservationStatusCountVO;
import com.korea.petclinic.vo.ReservationVO;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ReservationService {

	private final ReservationDAO reservationDAO;
	
	public List<ReservationVO> findAll() {
		return reservationDAO.findAll();
	}
	
	public ReservationVO findById(Long id) {
		return reservationDAO.findById(id);
	}
	
	public int insert(ReservationVO reservation) {
		return reservationDAO.insert(reservation);
	}
	
	public int update(ReservationVO reservation) {
		return reservationDAO.update(reservation);
	}
	
	public int delete(Long id) {
		return reservationDAO.delete(id);
	}
	
	 public List<ReservationVO> searchDetail(
	            String searchType,
	            String keyword) {

	        return reservationDAO.searchDetail(searchType, keyword);
	    }

	    // 문제 9
	    public List<ReservationVO> sortByPrice(String sort) {
	        return reservationDAO.sortByprice(sort);
	    }

	    // 문제 10
	    public List<ReservationStatusCountVO> countByStatus() {
	        return reservationDAO.countByStatus();
	    }
	}

