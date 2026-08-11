package com.korea.movie_reservation.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.korea.movie_reservation.service.ReservationService;
import com.korea.movie_reservation.vo.ReservationVO;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/reservations")
@RequiredArgsConstructor
public class ReservationController {

    private final ReservationService reservationService;

    @PostMapping
    public String insertReservation(
            @RequestBody ReservationVO reservationVO) {

        int result =
                reservationService.insertReservation(reservationVO);

        if (result == 1) {
            return "예매 등록 성공";
        }

        return "예매 등록 실패";
    }

    @PutMapping("/{reservationId}")
    public String updateReservation(
            @PathVariable Integer reservationId,
            @RequestBody ReservationVO reservationVO) {

        reservationVO.setReservationId(reservationId);

        int result =
                reservationService.updateReservation(reservationVO);

        if (result == 1) {
            return "예매 수정 성공";
        }

        return "예매 수정 실패";
    }

    @GetMapping("/details")
    public List<ReservationVO> findReservationDetails() {

        return reservationService.findReservationDetails();
    }
}
