<script lang="ts">
    import { onDestroy, onMount } from 'svelte';
    import assert from 'assertmin';

    type SpinnerPhase = 'SpinnerOnly' | 'ProgressBar' | 'Percentage' | 'GettingReady';
    type AnimationState = {
        startTime: number;
        progress: number;
        nextStepDuration: number;
        nextStepProgress: number;
        timeoutId: number;
        phaseIndex: number;
    };

    const phases: SpinnerPhase[] = [
        // 'ProgressBar',
        'SpinnerOnly',
        'ProgressBar',
        'SpinnerOnly',
        'Percentage',
        'SpinnerOnly',
        'Percentage',
        'GettingReady',
        'SpinnerOnly',
    ];

    export let onLoaded: () => void;

    let animationState: AnimationState | null = null;

    $: currentPhase = animationState && phases[animationState.phaseIndex];

    function onPhaseEnd() {
        const currentPhaseIndex = animationState?.phaseIndex ?? -1;

        animationState = {
            startTime: Date.now(),
            phaseIndex: (currentPhaseIndex + 1) % phases.length,
            nextStepDuration: getStepDuration(),
            nextStepProgress: getStepProgress(),
            timeoutId: animationState?.timeoutId ?? -1,
            progress: 0,
        };
    }

    const getStepDuration = () => 500 + Math.floor(Math.random() * 2000);
    const getStepProgress = () => Math.random() * 0.1;

    onPhaseEnd();

    function updateProgress() {
        assert(animationState !== null);

        console.log(`updating progress ${animationState.progress}`);

        if (animationState.progress >= 1) {
            onPhaseEnd();
        } else {
            animationState.progress = Math.min(1, animationState.progress + animationState.nextStepProgress);
        }

        animationState.nextStepDuration = getStepDuration();
        animationState.nextStepProgress = getStepProgress();

        animationHandle = window.setTimeout(updateProgress, animationState.nextStepDuration);
    }

    let animationHandle: number = -1;
    onMount(() => {
        assert(animationState !== null);

        animationHandle = window.setTimeout(updateProgress, animationState.nextStepDuration);
    });

    onDestroy(() => {
        if (typeof window !== 'undefined') {
            window.clearTimeout(animationHandle);
        }
    });
</script>

<svelte:window on:beforeunload|trusted={onLoaded} />

<div class="forever-loader">
    <div class="loading-spinner">
        <svg viewBox="25 25 50 50">
            <circle cx="50" cy="50" r="20" />
        </svg>
    </div>

    <div class="secondary-component">
        <!-- {currentPhase} {animationState?.progress} -->

        {#if currentPhase === 'ProgressBar' && animationState !== null}
            <div class="progress-bar">
                <div class="progress-bar-inner" style:width="{animationState.progress * 100}%"></div>
            </div>
        {/if}

        {#if currentPhase === 'Percentage' && animationState !== null}
            <div class="percentage-count">
                {Math.floor(animationState?.progress * 100)}%
            </div>
        {/if}

        {#if currentPhase === 'GettingReady'}
            <div class="disingenuous-message">
                Getting ready...
            </div>
        {/if}
    </div>
</div>

<style lang="scss">
.loading-spinner {
    display: flex;
    align-items: center;
    justify-content: center;
}

.loading-spinner svg {
    width: 3.75em;
    transform-origin: center;
    animation: rotate 2s linear infinite;
}

.loading-spinner circle {
    fill: none;
    stroke: #ccc;
    stroke-width: 2;
    stroke-dasharray: 1, 200;
    stroke-dashoffset: 0;
    stroke-linecap: round;
    animation: dash 1.5s ease-in-out infinite;
}

.progress-bar {
    width: 200px;
    border: 2px solid white;
    padding: 4px 8px;
    position: relative;
}

.progress-bar .progress-bar-inner {
    content: '';
    background: rgba(255, 255, 255, 0.3);
    height: 100%;
    width: 100%;
    position: absolute;
    top: 0;
    left: 0;
    transition: width linear 500ms;
}

.secondary-component {
    margin: 64px;
    text-align: center;
}

@keyframes rotate {
  100% {
    transform: rotate(360deg);
  }
}

@keyframes dash {
  0% {
    stroke-dasharray: 1, 200;
    stroke-dashoffset: 0;
  }
  50% {
    stroke-dasharray: 90, 200;
    stroke-dashoffset: -35px;
  }
  100% {
    stroke-dashoffset: -125px;
  }
}
</style>
